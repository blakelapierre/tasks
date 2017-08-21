import { h, Component } from 'preact';
import style from './style';

export default class Home extends Component {
  state = {
    tasks: [],
    max: 0
  }

  actions = {
    addTask (text, duration) {
      this.setState(this.actions.transforms.addTask.bind(this, text, duration));
    },

    updateTaskText (task, {target: {value}}) {
      this.setState(this.actions.transforms.updateTaskText.bind(this, task, value));
    },

    setTaskDone (task, {target:{checked}}) {
      this.setState(this.actions.transforms.setTaskDone.bind(this, task, checked));
    },

    remove (task) {
      this.setState(this.actions.transforms.removeTask.bind(this, task));
    },

    transforms: {
      addTask(text, duration, state) {
        state.tasks.push({text, duration});
        state.tasks.forEach(task => task.duration > state.max ? state.max = task.duration : undefined);
        state.tasks.sort((t1, t2) => t1.duration > t2.duration ? 1 : -1);
      },

      updateTaskText(task, text, state) {
        task.text = text;
      },

      setTaskDone(task, checked, state) {
        task.done = checked;

        if (checked) {
          task.removalInterval = setInterval(this.actions.remove.bind(this, task), 30 * 1000);
        }
        else {
          clearInterval(task.removalInterval);
        }
      },

      removeTask(task, state) {
        const index = state.tasks.indexOf(task);

        if (index >= 0) state.tasks.splice(index, 1);
      }
    }
  }

  render({}, {tasks, max}) {
    return (
      <home>
        <TaskList tasks={tasks} max={max} actions={this.actions} actionBase={this} />
        <TaskEntry onEntry={this.actions.addTask.bind(this)} />
      </home>
    );
  }
}


class TaskList extends Component {
  render({tasks, max, actions, actionBase}) {
    return (
      <task-list>
        {tasks.map(t => <Task task={t} max={max} actions={actions} actionBase={actionBase} onClick={() => console.log(t)} />)}
      </task-list>
    );
  }
}

class TaskEntry extends Component {
  buttonClick(onEntry) {
    onEntry(this.inputEl.value, parseFloat(this.durationEl.value));
    this.inputEl.value = '';
    this.inputEl.focus();
  }

  inputKeydown(onEntry, event) {
    if (event.keyCode === 13) this.buttonClick(onEntry);
  }

  render({onEntry}) {
    return (
      <task-entry>
        <task-input>
          <input type="text" ref={el => this.inputEl = el} placeholder="Enter task..." autofocus tabindex={0} onKeydown={this.inputKeydown.bind(this, onEntry)} />
          <duration-input>
            <input type="number" ref={el => this.durationEl = el} defaultValue={5} min={1} onKeydown={this.inputKeydown.bind(this, onEntry)} />
            <select value="minute(s)">
              <option disabled>$$$ second(s) $$$</option>
              <option>minute(s)</option>
              <option disabled>$$$ hour(s) $$$</option>
              <option disabled>$$$ days(s) $$$</option>
            </select>
          </duration-input>
        </task-input>
        <button onClick={this.buttonClick.bind(this, onEntry)}>+</button>
      </task-entry>
    );
  }
}

class Task extends Component {
  state = {
    editMode: false
  }

  toggleEditMode() {
    this.setState(({editMode}) => ({editMode: !editMode}));
  }

  render({task, max, actions: {setTaskDone, updateTaskText}, actionBase}, {editMode}) {
    const {text, duration, done} = task;
    return (
      <task className={done ? style['done'] : ''}>
        <duration-bar style={{width: `${duration / max * 100}%`}}></duration-bar>
        <info-line>
          <input type="checkbox" onChange={setTaskDone.bind(actionBase, task)} checked={done} />
          {editMode ?
              <input type="text" value={text} onBlur={event => updateTaskText.call(actionBase, task, event) & this.setState({editMode: false})} />
            : <task-text onClick={this.toggleEditMode.bind(this)}>{text}</task-text>
          }
          <duration>{duration} minutes</duration>
        </info-line>
      </task>
    );
  }
}