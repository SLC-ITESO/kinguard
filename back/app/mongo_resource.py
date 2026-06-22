import logging
from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Body, status
from pydantic import BaseModel, Field, ConfigDict

# Set logger
log = logging.getLogger(__name__)
log.setLevel(logging.INFO)

# Pydantic Models based on visit_type
class PacienteModel(BaseModel):
    pac_id: str
    nombre: str
    apellidos: str

class TutorModel(BaseModel):
    id_tutor: str
    nombre: str
    apellidos: str

class InvitadoModel(BaseModel):
    id_invitado: str
    nombre: str
    apellidos: str

class PulseraModel(BaseModel):
    hash: str
    role: str

class VisitBase(BaseModel):
    status: str
    fecha_visita: datetime = Field(default_factory=datetime.now)
    paciente: PacienteModel
    tutor_presente: List[TutorModel]
    invitados_presentes: List[InvitadoModel] = []
    pulseras_asignadas: List[PulseraModel] = []

class VisitCreate(VisitBase):
    pass

class VisitUpdate(BaseModel):
    status: Optional[str] = None
    fecha_visita: Optional[datetime] = None
    paciente: Optional[PacienteModel] = None
    tutor_presente: Optional[List[TutorModel]] = None
    pulseras_asignadas: Optional[List[PulseraModel]] = None

class VisitResponse(VisitBase):
    id: str = Field(alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )

    @classmethod
    def from_mongo(cls, data):
        if not data:
            return data
        data["_id"] = str(data["_id"])
        return cls(**data)

class VisitResource:
    def __init__(self, db):
        self.db = db
        # Collection name could be 'visitas'
        self.collection = self.db.visitas
        self.router = APIRouter(prefix="/visits", tags=["visits"])
        self.setup_routes()

    def setup_routes(self):
        self.router.add_api_route("/", self.get_all_visits, methods=["GET"], response_model=List[VisitResponse])
        self.router.add_api_route("/{visit_id}", self.get_visit, methods=["GET"], response_model=VisitResponse)
        self.router.add_api_route("/", self.create_visit, methods=["POST"], response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("/{visit_id}", self.update_visit, methods=["PUT"], response_model=VisitResponse)
        self.router.add_api_route("/{visit_id}", self.delete_visit, methods=["DELETE"], status_code=status.HTTP_204_NO_CONTENT)

    async def get_all_visits(self, pac_id: Optional[str] = None, tutor_id: Optional[str] = None, inv_id: Optional[str] = None):
        filter_query = {}
        if pac_id:
            filter_query["paciente.pac_id"] = pac_id
        if tutor_id:
            filter_query["tutor_presente.id_tutor"] = tutor_id
        if inv_id:
            filter_query["invitados_presentes.id_invitado"] = inv_id

        visits = []
        for visit in self.collection.find(filter_query):
            visits.append(VisitResponse.from_mongo(visit))
        return visits

    async def get_visit(self, visit_id: str):
        if not ObjectId.is_valid(visit_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")

        visit = self.collection.find_one({"_id": ObjectId(visit_id)})

        if not visit:
            raise HTTPException(status_code=404, detail="Visit not found")
        return VisitResponse.from_mongo(visit)

    async def create_visit(self, visit: VisitCreate = Body(...)):
        visit_dict = visit.model_dump()
        result = self.collection.insert_one(visit_dict)
        new_visit = self.collection.find_one({"_id": result.inserted_id})
        return VisitResponse.from_mongo(new_visit)

    async def update_visit(self, visit_id: str, visit_update: VisitUpdate = Body(...)):
        if not ObjectId.is_valid(visit_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")
        
        update_data = {k: v for k, v in visit_update.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        result = self.collection.update_one(
            {"_id": ObjectId(visit_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Visit not found")
            
        updated_visit = self.collection.find_one({"_id": ObjectId(visit_id)})
        return VisitResponse.from_mongo(updated_visit)

    async def delete_visit(self, visit_id: str):
        if not ObjectId.is_valid(visit_id):
            raise HTTPException(status_code=400, detail="Invalid ID format")
        result = self.collection.delete_one({"_id": ObjectId(visit_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Visit not found")
        return None