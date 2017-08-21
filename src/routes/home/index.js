import { h, Component } from 'preact';
import style from './style';

export default class Home extends Component {
  state = {
    tasks: [],
    max: 0
  }

  actions = {
    setTaskDone(task, {target:{checked}}) {
      this.setState(this.actions.transforms.setTaskDone.bind(this, task, checked));
    },

    remove (task) {
      this.setState(this.actions.transforms.removeTask.bind(this, task));
    },

    transforms: {
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

  addTask (text, duration) {
    this.setState(state => {
      state.tasks.push({text, duration});
      state.tasks.forEach(task => task.duration > state.max ? state.max = task.duration : undefined);
      state.tasks.sort((t1,t2)=>t1.duration>t2.duration?1:-1);
    });
  }

  render({}, {tasks, max}) {
    return (
      <home>
        <TaskList tasks={tasks} max={max} actions={this.actions} actionBase={this} />
        <TaskEntry onEntry={this.addTask.bind(this)} />
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
  render({onEntry}) {
    return (
      <task-entry>
        <task-input>
          <input type="text" ref={el => this.inputEl = el} placeholder="Enter task..." autofocus tabindex={0} />
          <duration-input>
            <input type="number" ref={el => this.durationEl = el} defaultValue={5} min={1} />
            <select value="minute(s)">
              <option disabled>$$$ second(s) $$$</option>
              <option>minute(s)</option>
              <option disabled>$$$ hour(s) $$$</option>
              <option disabled>$$$ days(s) $$$</option>
            </select>
          </duration-input>
        </task-input>
        <button onClick={() => onEntry(this.inputEl.value, parseFloat(this.durationEl.value)) & (this.inputEl.value = '') & this.inputEl.focus()}>+</button>
      </task-entry>
    );
  }
}

class Task extends Component {
  render({task, max, actions: {setTaskDone}, actionBase}) {
    const {text, duration, done} = task;
    console.log(duration, max);
    return (
      <task className={done ? style['done'] : ''}>
        <duration-bar style={{width: `${duration / max * 100}%`}}></duration-bar>
        <info-line>
          <input type="checkbox" onChange={setTaskDone.bind(actionBase, task)} checked={done} />
          <text tabindex={0}>{text}</text>
          <duration>{duration} minutes</duration>
        </info-line>
      </task>
    );
  }
}