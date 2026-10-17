import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';

// שליפת כל הקבוצות של המשתמש מהשרת
export const fetchUserGroups = createAsyncThunk('groups/fetchUserGroups', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/groups');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'שגיאה בטעינת הקבוצות');
  }
});

// יצירת קבוצה חדשה
export const createGroupThunk = createAsyncThunk('groups/createGroup', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/groups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'שגיאה ביצירת הקבוצה');
  }
});

// הצטרפות לקבוצה עם קוד
export const joinGroupThunk = createAsyncThunk('groups/joinGroup', async (code, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/groups/join', { code });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'שגיאה בהצטרפות לקבוצה');
  }
});

// הסרת חבר מהקבוצה
export const removeMemberThunk = createAsyncThunk('groups/removeMember', async ({ groupId, memberId }, { rejectWithValue }) => {
  try {
    const { data } = await API.delete(`/groups/${groupId}/members/${memberId}`);
    return { groupId, updatedGroup: data.group };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'שגיאה בהסרת חבר מהקבוצה');
  }
});

const initialState = {
  list: [],
  activeGroup: null,
  matches: [],
  history: [],
  loading: false,
  error: null
};

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setActiveGroup: (state, action) => {
      if (typeof action.payload === 'object' && action.payload !== null) {
        state.activeGroup = action.payload;
      } else {
        const found = state.list.find(g => g.code === action.payload || g._id === action.payload);
        state.activeGroup = found || null;
      }
    },
    addMatch: (state, action) => {
      state.matches.push(action.payload);
    },
    addToHistory: (state, action) => {
      state.history.unshift(action.payload);
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    clearGroupState: (state) => {
      state.list = [];
      state.activeGroup = null;
      state.matches = [];
      state.history = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.list = action.payload;
        if (action.payload && action.payload.length > 0 && !state.activeGroup) {
          state.activeGroup = action.payload[0];
        }
      })
      .addCase(createGroupThunk.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.activeGroup = action.payload;
      })
      .addCase(joinGroupThunk.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.activeGroup = action.payload;
      })
      .addCase(removeMemberThunk.fulfilled, (state, action) => {
        const { groupId, updatedGroup } = action.payload;
        const index = state.list.findIndex(g => g._id === groupId);
        if (index !== -1) {
          state.list[index] = updatedGroup;
        }
        if (state.activeGroup?._id === groupId) {
          state.activeGroup = updatedGroup;
        }
      });
  }
});

export const { 
  setActiveGroup, 
  addMatch, 
  addToHistory, 
  setHistory, 
  clearGroupState 
} = groupSlice.actions;

export default groupSlice.reducer;