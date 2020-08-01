import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface Direccion {
  id?,
  perfil_usuario?,
  id_usuario:string,
  direccion:string,
  distancia:number,
  fecha:any,
}


@Injectable({
  providedIn: 'root'
})

export class DireccionService {

  coleccionDirecciones: AngularFirestoreCollection<Direccion>;
  listaDirecciones: Observable<any[]>;

  constructor(public afs: AngularFirestore) {
    //Me conecto a la colección de la base de datos
    this.coleccionDirecciones = this.afs.collection('despertadorGPSApp');
    
    //Guardo el documento de las fotos, el pipe es para tener el id
    this.listaDirecciones = this.coleccionDirecciones.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      })
    );
   }


   getDirecciones(): Observable<Direccion[]> {
     
    //Uso pipe para crear un nuevo observable a partir del observable que recibo
    //Uso map para editar los resultados que me envía
    //Uso sort para ordenar las fotos mostrando primero la más nueva
    return this.listaDirecciones.pipe(map(listaDirecciones => listaDirecciones.sort( (direccionA, direccionB) => {

      console.log("ordeno")
        
        if(direccionA.fecha > direccionB.fecha) {
        
          return -1 //no ordena
        } else if (direccionA.fecha < direccionB.fecha){ 
          return 1 //ordena
        } else {
          return 0
        }
      })));

  }

 
  agregarDireccion(direccion: Direccion): Promise<DocumentReference> {
    return this.coleccionDirecciones.add(direccion);
  }

}
