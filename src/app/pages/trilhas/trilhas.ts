import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

interface Trilha{
  id: number;
  nome: string;
  descricao: string;
  distanciaMetros: number;
}

interface Usuario{
  id: number;
  nome: string;
  email: string;
  senha: string;
  papel: string;
}

@Component({
  imports: [FormsModule],
  selector: 'app-trilhas',
  templateUrl: './trilhas.html',
  styleUrl: './trilhas.css',
})

export class Trilhas{
  usuarioLogado = signal<Usuario | null>(null);
  trilhas = signal<Trilha[] | null>(null);
  idTrilha = signal<number>(0);
  nomeTrilha = signal<string>('');
  descricaoTrilha = signal<string>('');
  distanciaMetros = signal<number>(0);
  modalAberto = signal<boolean>(false);

  private http = inject(HttpClient);
  private notification = inject(NotificationService);

  excluir(id: number) {
    var token = localStorage.getItem("secret");
    this.http.delete<boolean>(`http://localhost:8080/api/trilhas/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    ).subscribe({
        next: (res) => {
            if (res === true) {
                this.notification.success('Trilha excluída com sucesso!');
                this.carregarTrilhas();
            }
        },
        error: (erro) => {
            console.log('Erro ao excluir trilha:', erro);
            this.notification.info('Erro ao excluir trilha!');
        }
    });
}

  fecharModal(){
    this.idTrilha.set(0);
    this.nomeTrilha.set("");
    this.descricaoTrilha.set("");
    this.distanciaMetros.set(0);
    this.modalAberto.set(false)
  }

  editar(id: number) {
    this.http.get<Trilha>(`http://localhost:8080/api/trilhas/${id}`).subscribe({
        next: (dados) => {
            console.log(dados);
            this.idTrilha.set(dados.id);
            this.nomeTrilha.set(dados.nome);
            this.descricaoTrilha.set(dados.descricao);
            this.distanciaMetros.set(dados.distanciaMetros);
            this.modalAberto.set(true);
        },
        error: (erro) => {
            console.error('Erro ao buscar trilha:', erro);
        }
    });
}


  carregarInfoUsuario() {
    var token = localStorage.getItem("secret");

    this.http.post<Usuario>(
        'http://localhost:8080/api/auth/info',
        token
    ).subscribe({
        next: (dados) => {
          console.log(dados);
            this.usuarioLogado.set(dados);
        },
        error: (erro) => {
            console.log("erro ao obter info do user");
        }
    });
}

  salvarTrilha(){
    const nome = this.nomeTrilha();
    const descricao = this.descricaoTrilha();
    const distanciaMetros = this.distanciaMetros();

    if (distanciaMetros > 100000){
      this.notification.warning("A trilha não pode ultrapassar 100 mil metros!");
      return;
    }

    if (nome == '' || descricao == '' ||  distanciaMetros == 0){
      this.notification.warning("Informe todos os campos!");
      return;
    }

   if (this.idTrilha() != 0) {

    const obj = {
        nome: this.nomeTrilha(),
        descricao: this.descricaoTrilha(),
        distanciaMetros: this.distanciaMetros()
    };

    this.http.put(`http://localhost:8080/api/trilhas/${this.idTrilha()}`, obj)
        .subscribe({
            next: (data) => {
                this.notification.success('Trilha atualizada com sucesso!');
                this.modalAberto.set(false);
                this.carregarTrilhas();
            },
            error: (erro) => {
                console.error('Erro ao atualizar trilha:', erro);
                this.notification.warning('Erro ao atualizar trilha!');
            }
        });
}else{

      const obj = { nome : this.nomeTrilha(), descricao : this.descricaoTrilha(), distanciaMetros: this.distanciaMetros() }
      this.http.post('http://localhost:8080/api/trilhas',obj,
        ).subscribe({
            next: (data) => {
            this.notification.success('Trilha criada com sucesso!');
            this.modalAberto.set(false);
            this.carregarTrilhas();
            },
            error: (erro) => {
            console.error('Erro ao criar a trilha:', erro);
            this.notification.warning('Erro ao criar a trilha');
            }
        });
   }
  }


  carregarTrilhas() {
  this.http.get<Trilha[]>('http://localhost:8080/api/trilhas').subscribe({
    next: (dados) => {
      this.trilhas.set(dados);
      console.log(dados);
    },
    error: (erro) => {
      console.log('Erro ao buscar trilhas:', erro);
    }
  });
}

  ngOnInit() {
    this.carregarInfoUsuario();
      this.carregarTrilhas();
    }
}