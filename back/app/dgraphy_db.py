import json
import secrets
from datetime import datetime
import pydgraph

def sanitize_dql(val):
    """Sanitize input for DQL queries by escaping double quotes."""
    if isinstance(val, str):
        return val.replace('"', '\\"')
    return val


# ==========================================
# SCHEMA
# ==========================================
def set_schema(client):
    schema = """
    type Paciente {
        id_paciente
        nombre
        apellidos
        foto_url
        fecha_inicio
        PERTENECE_A
    }

    type Tutor {
        id_tutor
        nombre
        apellidos
        foto_url
        relacion
        AUTORIZADO_PARA
    }

    type Invitado {
        id_invitado
        nombre
        apellidos
        foto_url
        identificacion_valida
        INVITADO_POR
    }

    id_paciente: string @index(exact) .
    id_tutor: string @index(exact) .
    id_invitado: string @index(exact) .

    nombre: string @index(term) .
    apellidos: string @index(term) .
    foto_url: string .
    fecha_inicio: datetime .
    relacion: string .
    identificacion_valida: bool .

    PERTENECE_A: [uid] @reverse .
    AUTORIZADO_PARA: [uid] @reverse .
    INVITADO_POR: [uid] @reverse .
    """
    return client.alter(pydgraph.Operation(schema=schema))


# ==========================================
# HELPER FOR RANDOM ID GENERATION
# ==========================================
def generar_sufijo_random():
    return "".join([str(secrets.randbelow(10)) for _ in range(6)])


# ==========================================
# OPERACIONES DE CREACIÓN (C)
# ==========================================

def crear_paciente(client, id_p, nombre, apellidos, fecha_ini):
    txn = client.txn()
    try:
        foto_url = f"/img/pac/{id_p}.png"
        p_data = {
            'uid': '_:paciente',
            'dgraph.type': 'Paciente',
            'id_paciente': id_p,
            'nombre': nombre,
            'apellidos': apellidos,
            'foto_url': foto_url,
            'fecha_inicio': datetime.strptime(fecha_ini, "%Y-%m-%d").isoformat() + "Z"
        }
        txn.mutate(set_obj=p_data)
        txn.commit()
        print(f"\n[OK] Paciente creado exitosamente.\nID asignado: {id_p}\nFoto: {foto_url}")
    except Exception as e:
        print(f"\n[ERROR] Al crear paciente: {e}")
    finally:
        txn.discard()


def crear_tutor(client, id_paciente, nombre, apellidos, relacion):
    txn = client.txn()
    try:
        id_paciente = sanitize_dql(id_paciente)
        # Validar existencia previa del paciente obligatoriamente
        query = f'{{ get_p(func: eq(id_paciente, "{id_paciente}")) {{ uid }} }}'
        res = json.loads(txn.query(query).json)
        if not res.get('get_p'):
            print(f"\n[ERROR] No existe el paciente '{id_paciente}'. El tutor debe estar linkeado obligatoriamente.")
            return

        paciente_uid = res['get_p'][0]['uid']
        id_tutor = f"TUT-{id_paciente}-{generar_sufijo_random()}"
        foto_url = f"/img/tut/{id_tutor}.png"

        t_data = {
            'uid': '_:tutor',
            'dgraph.type': 'Tutor',
            'id_tutor': id_tutor,
            'nombre': nombre,
            'apellidos': apellidos,
            'foto_url': foto_url,
            'relacion': relacion,
            'AUTORIZADO_PARA': [{'uid': paciente_uid}]  # Enlace directo al paciente
        }

        # Mutación inversa explícita para PERTENECE_A en el paciente
        p_update = {
            'uid': paciente_uid,
            'PERTENECE_A': [{'uid': '_:tutor'}]
        }

        txn.mutate(set_obj=[t_data, p_update])
        txn.commit()
        print(f"\n[OK] Tutor creado y linkeado exitosamente.\nID asignado: {id_tutor}\nFoto: {foto_url}")
    except Exception as e:
        print(f"\n[ERROR] Al crear tutor: {e}")
    finally:
        txn.discard()


def crear_invitado(client, id_paciente, nombre, apellidos):
    txn = client.txn()
    try:
        id_paciente = sanitize_dql(id_paciente)
        # Validar existencia previa del paciente obligatoriamente
        query = f'{{ get_p(func: eq(id_paciente, "{id_paciente}")) {{ uid }} }}'
        res = json.loads(txn.query(query).json)
        if not res.get('get_p'):
            print(f"\n[ERROR] No existe el paciente '{id_paciente}'. El invitado debe estar linkeado obligatoriamente.")
            return

        paciente_uid = res['get_p'][0]['uid']
        id_invitado = f"INV-{id_paciente}-{generar_sufijo_random()}"
        foto_url = f"/img/inv/{id_invitado}.png"

        i_data = {
            'uid': '_:invitado',
            'dgraph.type': 'Invitado',
            'id_invitado': id_invitado,
            'nombre': nombre,
            'apellidos': apellidos,
            'foto_url': foto_url,
            'identificacion_valida': True,
            'INVITADO_POR': [{'uid': paciente_uid}]  # Linkeado directamente al nodo paciente
        }

        txn.mutate(set_obj=i_data)
        txn.commit()
        print(f"\n[OK] Invitado creado y linkeado exitosamente.\nID asignado: {id_invitado}\nFoto: {foto_url}")
    except Exception as e:
        print(f"\n[ERROR] Al crear invitado: {e}")
    finally:
        txn.discard()


# ==========================================
# OPERACIONES DE LECTURA / GETS (R)
# ==========================================

def get_paciente(client, id_paciente):
    txn = client.txn(read_only=True)
    try:
        id_paciente = sanitize_dql(id_paciente)
        query = f"""{{
            paciente(func: eq(id_paciente, "{id_paciente}")) {{
                uid
                id_paciente
                nombre
                apellidos
                foto_url
                fecha_inicio
            }}
        }}"""
        res = json.loads(txn.query(query).json)
        pacientes = res.get('paciente', [])
        # print(json.dumps(pacientes, indent=2, ensure_ascii=False))
        return pacientes[0] if pacientes else None
    finally:
        txn.discard()


def get_tutor(client, id_tutor):
    txn = client.txn(read_only=True)
    try:
        id_tutor = sanitize_dql(id_tutor)
        query = f"""{{
            tutor(func: eq(id_tutor, "{id_tutor}")) {{
                uid
                id_tutor
                nombre
                apellidos
                foto_url
                relacion
                AUTORIZADO_PARA {{
                    id_paciente
                    nombre
                    apellidos
                    foto_url
                }}
            }}
        }}"""
        res = json.loads(txn.query(query).json)
        print(json.dumps(res.get('tutor', []), indent=2, ensure_ascii=False))
    finally:
        txn.discard()

def get_tutor_por_nombre_y_apellido(client, nombre, apellidos):
    txn = client.txn(read_only=True)
    try:
        nombre = sanitize_dql(nombre)
        apellidos = sanitize_dql(apellidos)
        # anyofterms busca nodos que coincidan con cualquier palabra ingresada
        query = f"""{{
            tutor(func: type(Tutor)) @filter(anyofterms(nombre, "{nombre}") AND anyofterms(apellidos, "{apellidos}")) {{
                uid
                id_tutor
                nombre
                apellidos
                foto_url
                relacion
                AUTORIZADO_PARA {{
                    id_paciente
                    nombre
                    apellidos
                    foto_url
                }}
            }}
        }}"""
        res = json.loads(txn.query(query).json)
        lista_tutores = res.get('tutor', [])

        # Imprime el resultado estructurado
        print(json.dumps(lista_tutores, indent=2, ensure_ascii=False))
        return lista_tutores
    except Exception as e:
        print(f"\n[ERROR] Al buscar tutor por nombre: {e}")
        return []
    finally:
        txn.discard()

def get_invitado(client, id_invitado):
    txn = client.txn(read_only=True)
    try:
        id_invitado = sanitize_dql(id_invitado)
        query = f"""{{
            invitado(func: eq(id_invitado, "{id_invitado}")) {{
                uid
                id_invitado
                nombre
                apellidos
                foto_url
                identificacion_valida
            }}
        }}"""
        res = json.loads(txn.query(query).json)
        print(json.dumps(res.get('invitado', []), indent=2, ensure_ascii=False))
    finally:
        txn.discard()


def get_tutores_de_paciente(client, id_paciente):
    txn = client.txn(read_only=True)
    try:
        id_paciente = sanitize_dql(id_paciente)
        query = f"""{{
            tutores(func: eq(id_paciente, "{id_paciente}")) {{
                nombre
                apellidos
                PERTENECE_A {{
                    id_tutor
                    nombre
                    apellidos
                    relacion
                    foto_url
                }}
            }}
        }}"""
        res = json.loads(txn.query(query).json)
        data = res.get('tutores', [])
        if data and 'PERTENECE_A' in data[0]:
            print(json.dumps(data[0]['PERTENECE_A'], indent=2, ensure_ascii=False))
        else:
            print("\n[] No se encontraron tutores vinculados a este paciente.")
    finally:
        txn.discard()


def get_invitados_de_paciente(client, id_paciente):
    txn = client.txn(read_only=True)
    try:
        id_paciente = sanitize_dql(id_paciente)
        # Usa la arista inversa @reverse del predicado INVITADO_POR
        query = f"""{{
            invitados(func: eq(id_paciente, "{id_paciente}")) {{
                nombre
                apellidos
                ~INVITADO_POR {{
                    id_invitado
                    nombre
                    apellidos
                    foto_url
                    identificacion_valida
                }}
            }}
        }}"""
        res = json.loads(txn.query(query).json)
        data = res.get('invitados', [])
        if data and '~INVITADO_POR' in data[0]:
            print(json.dumps(data[0]['~INVITADO_POR'], indent=2, ensure_ascii=False))
        else:
            print("\n[] No se encontraron invitados vinculados a este paciente.")
    finally:
        txn.discard()


# ==========================================
# OPERACIÓN DE ACTUALIZACIÓN (U)
# ==========================================

def actualizar_entidad(client, tipo_id, valor_id, predicado, nuevo_valor):
    txn = client.txn()
    try:
        tipo_id = sanitize_dql(tipo_id)
        valor_id = sanitize_dql(valor_id)
        query = f'{{ buscar(func: eq({tipo_id}, "{valor_id}")) {{ uid }} }}'
        res = json.loads(txn.query(query).json)

        if not res.get('buscar'):
            print("\n[!] Registro no encontrado para actualizar.")
            return

        uid = res['buscar'][0]['uid']
        if nuevo_valor.lower() == 'true':
            nuevo_valor = True
        elif nuevo_valor.lower() == 'false':
            nuevo_valor = False

        mutation = {
            'uid': uid,
            predicado: nuevo_valor
        }
        txn.mutate(set_obj=mutation)
        txn.commit()
        print(f"\n[OK] Campo '{predicado}' de {valor_id} actualizado a '{nuevo_valor}'.")
    except Exception as e:
        print(f"\n[ERROR] Al actualizar: {e}")
    finally:
        txn.discard()
