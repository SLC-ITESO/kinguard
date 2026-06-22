#!/usr/bin/env python3
import logging
import os
import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dgraphy_db import *
from mongo_client import *
from mongo_resource import VisitResource

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize MongoDB client and database
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client.visitas_pap_crit

# Fast API Init
app = FastAPI()

# Security Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": "An internal server error occurred."},
    )

# Initiate the resources
visit_resource = VisitResource(mongo_db)
app.include_router(visit_resource.router)

@app.get("/")
async def root():
    return {"message": "Kinguard Backend API"}

DGRAPH_URI = os.getenv('DGRAPH_URI', 'localhost:9080')

def create_client_stub():
    return pydgraph.DgraphClientStub(DGRAPH_URI)

def create_client(client_stub):
    return pydgraph.DgraphClient(client_stub)

def close_client_stub(client_stub):
    client_stub.close()

def menu_cru(client):
    while True:
        print("\n" + "=" * 50)
        print("    MENÚ DE CONTROL HÍBRIDO CRIT (DGRAPH)")
        print("=" * 50)
        print("1. [C] Crear Paciente (Hijo)")
        print("2. [C] Crear Tutor (Solicita ID Paciente)")
        print("3. [C] Crear Invitado (Solicita ID Paciente)")
        print("4. [R] GET Paciente por ID")
        print("5. [R] GET Tutor por ID")
        print("6. [R] GET Invitado por ID")
        print("7. [R] GET Tutores de un Paciente específico")
        print("8. [R] GET Invitados de un Paciente específico")
        print("9. [U] Actualizar datos de un registro")
        print("10. Salir")
        opcion = input("Selecciona una opción (1-10): ")

        if opcion == "1":
            id_p = input("ID Único Paciente (ej: PAC-100): ")
            nom = input("Nombre: ")
            ape = input("Apellidos: ")
            f_ini = input("Fecha Inicio (AAAA-MM-DD): ")
            crear_paciente(client, id_p, nom, ape, f_ini)

        elif opcion == "2":
            id_p = input("ID del Paciente al que se va a vincular: ")
            nom = input("Nombre del Tutor: ")
            ape = input("Apellidos del Tutor: ")
            rel = input("Relación (Padre/Madre/Abuelo): ")
            crear_tutor(client, id_p, nom, ape, rel)

        elif opcion == "3":
            id_p = input("ID del Paciente al que viene a visitar: ")
            nom = input("Nombre del Invitado: ")
            ape = input("Apellidos del Invitado: ")
            crear_invitado(client, id_p, nom, ape)

        elif opcion == "4":
            id_p = input("Ingresa id_paciente a buscar: ")
            print("\n--- RESULTADO PACIENTE ---")
            get_paciente(client, id_p)

        elif opcion == "5":
            id_t = input("Ingresa id_tutor a buscar (Completo con prefijo y random): ")
            print("\n--- RESULTADO TUTOR ---")
            get_tutor(client, id_t)

        elif opcion == "6":
            id_i = input("Ingresa id_invitado a buscar (Completo con prefijo y random): ")
            print("\n--- RESULTADO INVITADO ---")
            get_invitado(client, id_i)

        elif opcion == "7":
            id_p = input("Ingresa id_paciente para extraer sus Tutores: ")
            print(f"\n--- TUTORES ASOCIADOS AL PACIENTE {id_p} ---")
            get_tutores_de_paciente(client, id_p)

        elif opcion == "8":
            id_p = input("Ingresa id_paciente para extraer sus Invitados: ")
            print(f"\n--- INVITADOS ASOCIADOS AL PACIENTE {id_p} ---")
            get_invitados_de_paciente(client, id_p)

        elif opcion == "9":
            print("\n¿Qué tipo de registro vas a actualizar?")
            print("1. id_paciente | 2. id_tutor | 3. id_invitado")
            t_op = input("Selecciona (1-3): ")
            t_id = "id_paciente" if t_op == "1" else "id_tutor" if t_op == "2" else "id_invitado"
            v_id = input(f"Ingresa el identificador exacto de {t_id}: ")
            pred = input("Campo a modificar (nombre, apellidos, relacion, identificacion_valida): ")
            val = input("Nuevo valor: ")
            actualizar_entidad(client, t_id, v_id, pred, val)

        elif opcion == "10":
            print("\nSaliendo al proceso base...")
            break
        else:
            print("\n[!] Opción incorrecta.")

def menu_visitas():
    while True:
        print("\n" + "=" * 50)
        print("    MENÚ DE VISITAS (MONGODB)")
        print("=" * 50)
        print("1. [R] Ver todas las visitas")
        print("2. [R] GET Visita por Paciente")
        print("3. [R] GET Visita por Tutor")
        print("4. [R] GET Visita por Invitado")
        print("5. [U] Concluir visita por ID Paciente (más reciente)")
        print("6. Salir")
        
        opcion = input("Selecciona una opción (1-6): ")
        
        if opcion == "1":
            print("\n--- TODAS LAS VISITAS ---")
            visitas = get_visitas()
            print(json.dumps(visitas, indent=2, ensure_ascii=False))
            
        elif opcion == "2":
            id_p = input("Ingresa ID Paciente: ")
            print(f"\n--- VISITAS PACIENTE {id_p} ---")
            visitas = get_visitas(pac_id=id_p)
            print(json.dumps(visitas, indent=2, ensure_ascii=False))
            
        elif opcion == "3":
            id_t = input("Ingresa ID Tutor: ")
            print(f"\n--- VISITAS TUTOR {id_t} ---")
            visitas = get_visitas(tutor_id=id_t)
            print(json.dumps(visitas, indent=2, ensure_ascii=False))
            
        elif opcion == "4":
            id_i = input("Ingresa ID Invitado: ")
            print(f"\n--- VISITAS INVITADO {id_i} ---")
            visitas = get_visitas(inv_id=id_i)
            print(json.dumps(visitas, indent=2, ensure_ascii=False))
            
        elif opcion == "5":
            id_p = input("Ingresa ID Paciente para concluir su visita más reciente: ")
            concluir_visita(id_p)
            
        elif opcion == "6":
            break
        else:
            print("\n[!] Opción incorrecta.")


def test_dbs():
    # menú interactivo que importamos ESTO ES SOLO PARA TEST
    while True:
        print("1 -- DGRAPH TEST -- 1")
        print("2 -- MONGO (VISITAS) TEST -- 2")
        print("3 -- SALIR --")
        ch = input("Selecciona (1-2): ")
        if ch == "1":
            menu_cru(client)
        elif ch == "2":
            menu_visitas()
        elif ch == "3":
            break
        else:
            print("\n[!] Opción incorrecta.")


def check_id(client, id_pac):
    paciente = get_paciente(client, id_pac)
    if paciente:
        print(f"[INFO] Paciente existente: {paciente.get('nombre')} {paciente.get('apellidos')}")
        return paciente
    else:
        print("[INFO] Paciente no existente, re escanear")
        return None


def term_visita(id_pac, id_tutor, id_invitado):
    pass


if __name__ == '__main__':
    stub = create_client_stub()
    client = create_client(stub)

    try:
        # Esquema
        print("[INFO] Aplicando esquema en Dgraph...")
        set_schema(client)
        # INICIO
        while True:
            id_pac = input("Escanea (EN ESTE CASO ID DEL PACIENTE) la credencial: ")
            if id_pac == "testdbs":
                test_dbs()
            else:
                paciente_info = check_id(client, id_pac)
                if paciente_info:
                    print("[INFO] Tutores / Gente de Confianza del Paciente: ")
                    get_tutores_de_paciente(client, id_pac)

                    nom_adulto = input("Ingresa el nombre [NO APELLIDOS] del tutor/confianza responsable: ")

                    while True:
                        apll_adulto = input("Ingresa los apellidos del tutor/confianza responsable: ")

                        print("\n--- BUSCANDO ADULTO AUTORIZADO ---")
                        resultados = get_tutor_por_nombre_y_apellido(client, nom_adulto, apll_adulto)

                        tutor_info = None
                        if not resultados:
                            print("[ALARMA] El adulto no se encuentra registrado en el sistema.")
                        else:
                            print(f"[OK] Se encontraron {len(resultados)} coincidencia(s).")
                            tutor_info = resultados[0] # Tomamos el primero para la visita
                            break

                    num_adult = input("[INFO] Adultos de visita:")
                    num_men = input("[INFO] Menores de visita:")

                    # Mapear a los modelos de Pydantic
                    p_model = {
                        "pac_id": paciente_info.get("id_paciente"),
                        "nombre": paciente_info.get("nombre"),
                        "apellidos": paciente_info.get("apellidos")
                    }
                    
                    t_model = None
                    if tutor_info:
                        t_model = {
                            "id_tutor": tutor_info.get("id_tutor"),
                            "nombre": tutor_info.get("nombre"),
                            "apellidos": tutor_info.get("apellidos")
                        }

                    nueva_visita(p_model, t_model, num_adult, num_men)

    except Exception as e:
        print(f"[ERROR System] Ocurrió un fallo en la ejecución: {e}")
    finally:
        # 4. Cerrar la conexión limpiamente al salir del menú
        close_client_stub(stub)
        print("[INFO] Conexión con Dgraph cerrada.")