import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  courseSectionData: [],
  courseEntireData: [],
  completedLectures: [],
  totalNoOfLectures: 0,
  // { [subSectionId]: secondsWatched } — furthest point reached per lecture
  watchProgress: {},
  // final exam summary from /exam/status ({ hasExam, passed, ... }) or null
  examInfo: null,
}

const viewCourseSlice = createSlice({
  name: "viewCourse",
  initialState,
  reducers: {
    setCourseSectionData: (state, action) => {
      state.courseSectionData = action.payload
    },
    setEntireCourseData: (state, action) => {
      state.courseEntireData = action.payload
    },
    setTotalNoOfLectures: (state, action) => {
      state.totalNoOfLectures = action.payload
    },
    setCompletedLectures: (state, action) => {
      state.completedLectures = action.payload
    },
    updateCompletedLectures: (state, action) => {
      state.completedLectures = [...state.completedLectures, action.payload]
    },
    setExamInfo: (state, action) => {
      state.examInfo = action.payload
    },
    setWatchProgress: (state, action) => {
      state.watchProgress = action.payload || {}
    },
    updateWatchProgress: (state, action) => {
      const { subSectionId, seconds } = action.payload
      if ((state.watchProgress[subSectionId] || 0) < seconds) {
        state.watchProgress[subSectionId] = seconds
      }
    },
  },
})

export const {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
  updateCompletedLectures,
  setWatchProgress,
  updateWatchProgress,
  setExamInfo,
} = viewCourseSlice.actions

export default viewCourseSlice.reducer
