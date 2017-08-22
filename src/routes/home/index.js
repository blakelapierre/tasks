import { h, Component } from 'preact';
import style from './style';

export default class Home extends Component {
  state = JSON.parse(localStorage['state'] || '0') || {
    tasks: [],
    max: 0,
    taskID: 0
  }

  saveState() {
    localStorage['state'] = JSON.stringify(this.state);
  }

  actions = {
    addTask (text, estimate) {
      this.setState(this.actions.transforms.addTask.bind(this, text, estimate));
      this.saveState();
    },

    updateTaskText (task, {target: {value}}) {
      this.setState(this.actions.transforms.updateTaskText.bind(this, task, value));
      this.saveState();
    },

    toggleTask (task) {
      (task.work && task.work[task.work.length - 1].length === 1 ? this.actions.stopTask : this.actions.startTask).call(this, task);
    },

    startTask (task) {
      this.setState(this.actions.transforms.startTask.bind(this, task));
      this.saveState();
    },

    stopTask (task) {
      this.setState(this.actions.transforms.stopTask.bind(this, task));
      this.saveState();
    },

    setTaskDone (task, {target:{checked}}) {
      this.setState(this.actions.transforms.setTaskDone.bind(this, task, checked));
      this.saveState();
    },

    remove (task) {
      this.setState(this.actions.transforms.removeTask.bind(this, task));
      this.saveState();
    },

    transforms: {
      addTask(text, estimate, state) {
        const id = state.taskID++;

        insertByEstimate(state.tasks, {id, text, estimate}, estimate);

        if (estimate > state.max) state.max = estimate;

        function insertByEstimate(tasks, task, estimate) {
          for (let i = 0; i < tasks.length; i++) {
            if (estimate < tasks[i].estimate) {
              tasks.splice(i, 0, task);
              return;
            }
          }
          tasks.push(task);
        }
      },

      updateTaskText(task, text, state) {
        task.text = text;
      },

      startTask(task, state) {
        task.running = true;
        task.work = task.work || [];
        task.work.push([new Date().getTime()]);
      },

      stopTask(task, state) {
        const work = task.work[task.work.length - 1];
        work[1] = new Date().getTime();
        task.workDuration = (task.workDuration || 0) + (work[1] - work[0]) / 1000 / 60;
        delete task.running;
        if (task.workDuration > state.max) state.max = task.workDuration;
      },

      setTaskDone(task, checked, state) {
        task.done = checked;

        if (checked) {
          task.removalInterval = setInterval(this.actions.remove.bind(this, task), 30 * 1000);
        }
        else {
          clearInterval(task.removalInterval);
        }

        if (task.running) this.actions.stopTask.call(this, task)
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
        {tasks.map(t => <Task key={t.id} task={t} max={max} actions={actions} actionBase={actionBase} />)}
      </task-list>
    );
  }
}

class TaskEntry extends Component {
  buttonClick(onEntry) {
    onEntry(this.inputEl.value, parseFloat(this.estimateEl.value));
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
          <estimate-input>
            <input type="number" ref={el => this.estimateEl = el} defaultValue={5} min={1} onKeydown={this.inputKeydown.bind(this, onEntry)} />
            <select value="minute(s)" disabled>
              <option disabled>$$$ second(s) $$$</option>
              <option>minute(s)</option>
              <option disabled>$$$ hour(s) $$$</option>
              <option disabled>$$$ days(s) $$$</option>
            </select>
          </estimate-input>
        </task-input>
        <button onClick={this.buttonClick.bind(this, onEntry)}>+</button>
      </task-entry>
    );
  }
}

class Task extends Component {
  state = {
    editMode: false,
    workDuration: (this.props.task.workDuration || 0) + (this.props.task.work ? new Date().getTime() - this.props.task.work[this.props.task.work.length - 1][0] : 0) / 1000 / 60
  }

  toggleEditMode() {
    this.setState(({editMode}) => ({editMode: !editMode}));
  }

  render({task, max, actions: {setTaskDone, updateTaskText, toggleTask}, actionBase}, {editMode}) {
    const {text, estimate, done, work, workDuration, running} = task;

    // if (work && work[work.length - 1].length === 1) this.interval = setInterval(this.updateWorkDuration.bind(this), 1000);
    // else if (this.interval) clearInterval(this.interval);

    return (
      <task className={done ? style['done'] : ''} onClick={toggleTask.bind(actionBase, task)}>
        <estimate-bar style={{width: `${estimate / max * 100}%`}}></estimate-bar>
        <duration-bar style={{width: `${workDuration / max * 100}%`}}></duration-bar>
        <info-line>
          <input type="checkbox" onChange={setTaskDone.bind(actionBase, task)} checked={done} onClick={event => event.stopPropagation()} />
          {editMode ?
              <input type="text" value={text} onBlur={event => updateTaskText.call(actionBase, task, event) & this.setState({editMode: false})} />
            : <task-text onClick={this.toggleEditMode.bind(this)}>{text}</task-text>
          }
          <estimate>{estimate} minute(s)</estimate>
          <status>{running ? 'running' : ''} {((workDuration || 0) / estimate * 100).toFixed(2)}%</status>
        </info-line>
      </task>
    );
  }
}