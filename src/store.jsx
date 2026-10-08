// store.js
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./Slices/counterSlice";
import authReducer from "./Slices/authSlice";
import usersReducer from "./Slices/userSlice";
import pillarReducer from "./Slices/pillarSlice";
import kpiReducer from "./Slices/kpiSlice";
import srapReducer from "./Slices/srapSlice";
import stakeholderSrapReducer from "./Slices/stakeholderSrapSlice";
import objectiveReducers from "./Slices/objectiveSlice";
import stakeholderObjectivesReducer from "./Slices/stakeholderObjectivesSlice";
import stakeholderActivitiesReducer from "./Slices/stakeholderActivitiesSlice";
import departmentReducer from "./Slices/departmentSlice";
import rolesReducers from "./Slices/roleSlice";
import scoreCardReducers from "./Slices/scoreCardSlice";
import versionsReducer from "./Slices/versionSlice";
import yearReducer from "./Slices/yearSlice";
import scoreCardConfigReducer from "./Slices/scoreCardConfigSlice";
import globalFilterReducer from "./Slices/globalFilterSlice";

export const store = configureStore({
  reducer: {
    authSlice: authReducer,
    users: usersReducer,
    counter: counterReducer,
    pillars: pillarReducer,
    sraps: srapReducer,
    stakeholderSraps: stakeholderSrapReducer,
    departments: departmentReducer,
    roles: rolesReducers,
    kpi: kpiReducer,
    objectives: objectiveReducers,
    stakeholderObjectives: stakeholderObjectivesReducer,
    stakeholderActivities: stakeholderActivitiesReducer,
    scoreCard: scoreCardReducers,
    versions: versionsReducer,
    years: yearReducer,
    scoreCardConfig: scoreCardConfigReducer,
    globalFilter: globalFilterReducer,
  },
});
