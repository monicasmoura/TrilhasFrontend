import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

interface Usuario{
  id: number;
  nome: string;
  email: string;
  senha: string;
  papel: string;
}

@Component({
  imports: [FormsModule],
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})

export class Usuarios{
  usuarios = signal<Usuario[] | null>(null);
  idUsuario = signal<number>(0);
  nomeUsuario = signal<string>('');
  emailUsuario = signal<string>('');
  papelUsuario = signal<string>('');
  modalAberto = signal<boolean>(false);

  private http = inject(HttpClient);
  private notification = inject(NotificationService);

  excluir(id: number) {
    var token = localStorage.getItem("secret");
    this.http.delete<boolean>(`http://localhost:8080/api/usuarios/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    ).subscribe({
        next: (res) => {
            if (res === true) {
                this.notification.success('Usuário excluído com sucesso!');
                this.carregarUsuarios();
            }
        },
        error: (erro) => {
            console.log('Erro ao excluir usuário:', erro);
            this.notification.info('Erro ao excluir usuário!');
        }
    });
}

  fecharModal(){
    this.idUsuario.set(0);
    this.nomeUsuario.set("");
    this.emailUsuario.set("");
    this.papelUsuario.set("");
    this.modalAberto.set(false)
  }

  editar(id: number) {
      this.http.get<Usuario>(`http://localhost:8080/api/usuarios/${id}`).subscribe({
          next: (dados) => {
              console.log(dados);
              this.idUsuario.set(dados.id);
              this.nomeUsuario.set(dados.nome);
              this.emailUsuario.set(dados.email);
              this.papelUsuario.set(dados.papel);
              this.modalAberto.set(true);
          },
          error: (erro) => {
              console.error('Erro ao buscar usuario:', erro);
          }
      });
  }


  salvarAlteracao() {

    const token = localStorage.getItem("secret");

    this.http.put<boolean>(
        `http://localhost:8080/api/usuarios/${this.idUsuario()}`,
        {
            papel: this.papelUsuario()
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    ).subscribe({

        next: (res) => {
            this.notification.success('Usuário atualizado com sucesso!');
            this.fecharModal();
            this.carregarUsuarios();
        },

        error: (erro) => {
            console.error('Erro ao atualizar usuário:', erro);
            this.notification.info('Erro ao atualizar usuário!');
        }

    });

}


  
  carregarUsuarios() {
  this.http.get<Usuario[]>('http://localhost:8080/api/usuarios').subscribe({
    next: (dados) => {
      this.usuarios.set(dados);
    },
    error: (erro) => {
      console.log('Erro ao buscar usuarios:', erro);
    }
  });
}

  ngOnInit() {
      this.carregarUsuarios();
    }
}