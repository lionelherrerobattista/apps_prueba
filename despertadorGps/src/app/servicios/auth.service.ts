import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private AngularFireAuth: AngularFireAuth) { }

  login(email:string, password:string) {

    return new Promise((resolve, rejected) => {

      this.AngularFireAuth.signInWithEmailAndPassword(email, password).then(user => {
        resolve(user);
      }).catch(error => rejected(error));
    })
    
  }

  devolverUserLogeado() {
    return this.AngularFireAuth.user;
  }
}
