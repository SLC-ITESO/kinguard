import os
import logging
import requests
import hashlib
import json
import secrets

def nueva_visita(paciente_info, tutor_info, num_adult, num_men):
    # API endpoint
    api_base_url = os.getenv('API_BASE_URL', 'http://localhost:8000')
    url = f"{api_base_url}/visits/"
    
    # 1. Preparar los datos iniciales de la visita
    visit_data = {
        "status": "in_progress",
        "paciente": paciente_info,
        "tutor_presente": [tutor_info] if tutor_info else [],
        "pulseras_asignadas": []
    }
    
    try:
        # Intentar crear la visita vía POST a la API
        response = requests.post(url, json=visit_data)
        if response.status_code != 201:
            print(f"[ERROR] No se pudo crear la visita en la API: {response.text}")
            return None
        
        new_visit = response.json()
        visit_id = new_visit["_id"]
        print(f"\n[OK] Visita creada exitosamente en MongoDB. ID: {visit_id}")
        
        pulseras = []
        
        # 2. Prompts para pulseras de menores
        for i in range(int(num_men)):
            input(f"[{i+1}/{num_men}] Acercar pulsera del menor y presiona ENTER...")
            token = secrets.token_hex(8)
            print(f"Token generado (menor): {token}")
            pulseras.append({"hash": token, "role": "menor"})
            
        # 3. Prompts para pulseras de adultos
        for i in range(int(num_adult)):
            input(f"[{i+1}/{num_adult}] Acercar pulsera de adulto y presiona ENTER...")
            token = secrets.token_hex(8)
            print(f"Token generado (adulto): {token}")
            pulseras.append({"hash": token, "role": "adulto"})
            
        # 4. Actualizar la visita con los tokens generados vía PUT
        update_url = f"{url}{visit_id}"
        update_data = {"pulseras_asignadas": pulseras}
        
        response = requests.put(update_url, json=update_data)
        if response.status_code == 200:
            print("\n[OK] Pulseras vinculadas y guardadas en la visita.")
            return response.json()
        else:
            print(f"[ERROR] No se pudieron asignar las pulseras: {response.text}")
            return new_visit
            
    except Exception as e:
        print(f"[ERROR] Fallo en la comunicación con FastAPI: {e}")
        print("[HINT] Asegúrate de que el servidor FastAPI esté corriendo (uvicorn main:app --reload)")
        return None

def get_visitas(pac_id=None, tutor_id=None, inv_id=None):
    # API endpoint
    api_base_url = os.getenv('API_BASE_URL', 'http://localhost:8000')
    url = f"{api_base_url}/visits/"
    params = {}
    if pac_id: params["pac_id"] = pac_id
    if tutor_id: params["tutor_id"] = tutor_id
    if inv_id: params["inv_id"] = inv_id
    
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"[ERROR] Error al obtener visitas: {response.text}")
            return []
    except Exception as e:
        print(f"[ERROR] Fallo en la comunicación con FastAPI: {e}")
        return []

def concluir_visita(pac_id):
    # Obtener todas las visitas del paciente
    visitas = get_visitas(pac_id=pac_id)
    if not visitas:
        print(f"[ERROR] No se encontraron visitas para el paciente con ID: {pac_id}")
        return None
    
    # Ordenar por fecha_visita de forma descendente (la más reciente primero)
    # Pydantic serializa datetime a ISO string, por lo que el sort funciona directamente
    visitas.sort(key=lambda x: x.get('fecha_visita', ''), reverse=True)
    ultima_visita = visitas[0]
    
    # El ID puede venir como _id o id dependiendo de la serialización
    visit_id = ultima_visita.get('_id') or ultima_visita.get('id')
    
    if not visit_id:
        print("[ERROR] No se pudo identificar el ID de la visita.")
        return None

    # API endpoint
    api_base_url = os.getenv('API_BASE_URL', 'http://localhost:8000')
    url = f"{api_base_url}/visits/{visit_id}"
    update_data = {"status": "concluded"}
    
    try:
        response = requests.put(url, json=update_data)
        if response.status_code == 200:
            print(f"\n[OK] Estatus de la visita (ID: {visit_id}) actualizado a 'concluded'.")
            return response.json()
        else:
            print(f"[ERROR] No se pudo concluir la visita: {response.text}")
            return None
    except Exception as e:
        print(f"[ERROR] Fallo en la comunicación con FastAPI: {e}")
        return None
