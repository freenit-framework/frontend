import { decorate, observable, computed } from 'mobx'


export default decorate(
  class TodoStore {
    todos = []

    pendingRequests = 0

    get completedTodosCount() {
      return this.todos.filter(todo => todo.completed === true).length
    }

    get report() {
      if (this.todos.length === 0) {
        return '<none>'
      }
      return `Next todo: "${this.todos[0].task}". `
        + `Progress: ${this.completedTodosCount}/${this.todos.length}`
    }

    addTodo(task) {
      this.todos.push({
        task,
        completed: false,
        assignee: null,
      })
    }
  },

  {
    todos: observable,
    pendingRequests: observable,
    completedTodosCount: computed,
    report: computed,
  },
)
