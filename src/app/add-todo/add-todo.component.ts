import {Component} from '@angular/core';
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatCard} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ApiService} from "../service/api.service";
import {TodoStore} from "../state/store";
import {Router} from "@angular/router";

@Component({
  selector: 'app-add-todo',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    MatCard,
    MatButton,
    ReactiveFormsModule
  ],
  templateUrl: './add-todo.component.html',
  styleUrl: './add-todo.component.css'
})
export class AddTodoComponent {
  todoForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private  todoStore: TodoStore, private router: Router) {
    this.todoForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  addTodo(): void {
    this.todoStore.setLoading(true);
    this.apiService.addTodo(
      this.todoForm.controls['title'].value,
      this.todoForm.controls['description'].value
    ).subscribe(res => {
      this.todoStore.update(state => {
        return {
          todos : [
            ...state.todos,
            res
          ]
        };
      });
      this.todoStore.setLoading(false);
      this.router.navigateByUrl('/add-todo');
    });
  }


}
