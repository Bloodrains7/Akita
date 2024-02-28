import {Component, OnInit} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatCard} from "@angular/material/card";
import {Router} from "@angular/router";
import {TodoQuery} from "../state/query";
import {TodoStore} from "../state/store";
import {Todo, TodoStatus} from "../model/todo";
import {filter, Observable, switchMap, take} from "rxjs";
import {ApiService} from "../service/api.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatProgressSpinner,
    NgIf,
    NgForOf,
    NgClass
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  loading: boolean = false;
  todos: Todo[] = [];

  constructor(private router: Router, private todoQuery: TodoQuery, private todoStore: TodoStore, private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.todoQuery.getIsLoading().subscribe(res => this.loading = res);
    this.todoQuery.getTodos().subscribe(res => this.todos = res);
    this.todoQuery.getLoaded().pipe(
      take(1),
      filter(res => !res),
      switchMap(() => {
        this.todoStore.setLoading(true);
        return this.apiService.getTodos();
      })
    ).subscribe(res => {
      this.todoStore.update(state => {
        return {
          todos: res
        }
      });
      this.todoStore.setLoading(false);
    });
  }

  addTodo() {
    this.router.navigateByUrl('/add-todo');
  }

  markAsComplete(id: string): void {
    this.apiService.updateTodo(id, TodoStatus.DONE).subscribe(res => {
      this.todoStore.update(state => {
        const todos = [...state.todos];
        const index = todos.findIndex(t => t.id === id);
        todos[index] = {
          ...todos[index],
          status: TodoStatus.DONE
        };
        return {
          ...state,
          todos
        }
      });
    }, err => console.log(err));
  }

  deleteTodo(id: string): void {
    this.apiService.deleteTodo(id).subscribe(res => {
      this.todoStore.update(state => {
        return {
          todos: state.todos.filter(todo => todo.id !== id)
        }
      });
    }, err => console.log(err));
  }
}
