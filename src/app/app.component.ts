import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

interface ITodoItem {
  id: number;
  assignedTo?: string;
  description: string;
  done?: boolean
}
interface IPerson {
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'your To-Do List';
  host = 'http://localhost:8080/api';
  people: Observable<IPerson[]>;
  observe_todos: Observable<ITodoItem[]>;
  todos: ITodoItem[];
  new_description: string;
  edit: boolean = false;
  nameFilter = 'No Filter';
  doneFilter = 'No Filter';

  constructor(private httpClient: HttpClient) {
    this.loadTodoList();
    this.people = httpClient.get<IPerson[]>(this.host + '/people');
  }
  /** loads all the ToDo Items that are currently existing from the API*/
  loadTodoList() {
    this.httpClient.get<ITodoItem[]>(this.host + '/todos').subscribe(next => {
      this.todos = next;
    });
  }
  /** updates the fields of the array of Todo Items when a new element was added so that the user also sees the change */
  loadTodoItem(id: number){
    this.httpClient.get<ITodoItem>(this.host+'/todos/'+id).subscribe(item =>{
      let index=this.todos.findIndex(todo => todo.id === id);
      this.todos[index].assignedTo=item.assignedTo;
      this.todos[index].done=item.done;
      this.todos[index].description=item.description;
    });
  }
  /** filters the Todo Items by their assignees */
  filterNames() {
    this.nameFilter = (document.getElementById('filter_names') as any).value;
  }
  /** filters the Todo Items by done or undone */
  filterDones() {
    this.doneFilter = (document.getElementById('filter_dones') as any).value;
  }
  /** creates a new ToDo Item and sends it to the API */
  createNewTodoItem() {
    let body = { 'description': this.new_description, 'assignedTo': (document.getElementById('new_assignee') as any).value };

    this.httpClient.post(this.host + '/todos', body, { headers: { 'Content-Type': 'application/json' } }).subscribe(() => {
      this.loadTodoList();
    });
  }
  /**
   * deletes an element
   * @param id - the id of the element which should be deleted
   */
  delete(id: number) {
    this.httpClient.delete(this.host + '/todos/' + id).subscribe(() => {
      this.loadTodoList();
    });
  }
  /**
   * updates the changed field by writing it into the API
   * @param id - the id of the element which is to change
   * @param field - the name of the field as it is defined in the API
   */
  save(id: number, field: string) {
    let body;
    let value = (document.getElementById(field + id) as any).value;

    //create the right body depending on the field that was edited
    switch (field) {
      case 'description': body = { 'description': value }; break;
      case 'assignedTo': body = { 'assignedTo': value }; break;
      case 'done':
        value = (document.getElementById(field + id) as any).checked;
        body = { 'done': value }; break;
    }

    //send patch
    this.httpClient.patch(this.host + '/todos/' + id, body,
      { headers: { 'Content-Type': 'application/json' } })
      .subscribe(() => {
        this.loadTodoItem(id);
        //this.loadTodoList();
      });
  }
}