import { observable, action, computed, configure, runInAction } from 'mobx'
import { createContext, SyntheticEvent } from 'react'
import { IActivity } from '../models/activity';
import agent from '../api/agent';

configure({ enforceActions: 'always' }); // see: this enables -> mobx stict mode

class ActivityStore {
  @observable activityRegistry = new Map(); // See: Observable maps
  @observable activities: IActivity[] = [];
  @observable activity: IActivity | undefined;
  @observable loadingInitial = false;
  @observable editMode = false;
  @observable submitting = false;
  @observable target = '';

  @computed get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  }

  // see: we use runInAction because of mobx strict mode!
  // when in strict mode -> mobx state must be modified only inside an @action
  // but because await is syntactic sugar for .then()
  // the code inside .then() is actually not in @action
  // that's why we need runInAction utility method that comes from mobx
  @action loadActivities = async () => {
    this.loadingInitial = true;
    try {
      const activities = await agent.Activities.list();
      runInAction('loading activities', () => { // see: we use runInAction because of mobx strict mode!
        activities.forEach(activity => {
          activity.date = activity.date.split('.')[0];
          this.activityRegistry.set(activity.id, activity);
        });
      })
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('load activities finally', () => {
        this.loadingInitial = false;
      })
    }
  }

  @action loadActivity = async (id: string) => {
    let activity = this.getActivity(id);

    if (activity) {
      this.activity = activity;
    } else {
      this.loadingInitial = true;
      try {
        activity = await agent.Activities.details(id);
        runInAction('getting activity', () => {
          this.activity = activity;
        })
      } catch (error) {
        console.log(error);
      } finally {
        runInAction('get activity error', () => {
          this.loadingInitial = false;
        })
      }
    }
  }

  getActivity = (id: string) => {
    return this.activityRegistry.get(id);
  }

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.create(activity);
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity);
        this.editMode = false;
      })
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('creating activity finally', () => {
        this.submitting = false;
      })
    }
  }

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true;
    try {
      await agent.Activities.update(activity);

      runInAction('editing activity finally', () => {
        this.activityRegistry.set(activity.id, activity);
        this.activity = activity;
        this.editMode = false;
      });
    } catch (error) {
      console.log(error);
    }
    finally {
      runInAction('editing activity finally', () => {
        this.submitting = false;
      })
    }
  }

  @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
    this.submitting = true;
    this.target = event.currentTarget.name;
    try {
      await agent.Activities.delete(id);
      runInAction('editing activity finally', () => {
        this.activityRegistry.delete(id);
      })
    } catch (error) {
      console.log(error);
    } finally {
      runInAction('deleting activity finally', () => {
        this.submitting = false;
        this.target = '';
      })
    }
  }

  @action openCreateForm = () => {
    this.editMode = true;
    this.activity = undefined;
  }

  @action openEditForm = (id: string) => {
    this.activity = this.activityRegistry.get(id);
    this.editMode = true;
  }

  @action cancelSelectedActivity = () => {
    this.activity = undefined;
  }

  @action cancelFormOpen = () => {
    this.editMode = false;
  }

  @action selectActivity = (id: string) => {
    this.activity = this.activityRegistry.get(id);
    this.editMode = false;
  }
}

export default createContext(new ActivityStore())