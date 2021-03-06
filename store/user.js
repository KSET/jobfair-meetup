import Vue from "vue";
import {
  isAdmin,
  isModerator,
  isStudent,
} from "~/api/helpers/permissions";
import {
  isGateGuardian,
} from "~/helpers/auth";
import {
  dotGet,
} from "~/helpers/data";

export const state = () => (
  {
    user: null,
    token: null,
    refreshToken: null,
  }
);

export const getters = {
  getUser({ user }) {
    return user;
  },

  getCompany(store) {
    const { user } = store;
    const { companies = [] } = user;

    if (0 < companies.length) {
      return companies[0];
    }

    return null;
  },

  getToken({ token }) {
    return token;
  },

  getRefreshToken({ refreshToken }) {
    return refreshToken;
  },

  isModerator({ user }) {
    return isModerator(user.role);
  },

  isAdmin({ user }) {
    return isAdmin(user.role);
  },

  isStudent({ user }) {
    return isStudent(user.role);
  },

  isGateGuardian({ user }) {
    return isGateGuardian(user);
  },

  isLoggedIn({ user }) {
    return Boolean(user);
  },

  hasCv({ user }) {
    return Boolean(dotGet(user, "uid", null));
  },

  hasCompany({ user }) {
    return Boolean(dotGet(user, "companies.length", 0));
  },
};

export const mutations = {
  SET_USER(state, user) {
    Vue.set(state, "user", user);
  },

  SET_TOKEN(state, token) {
    Vue.set(state, "token", token);
  },

  SET_REFRESH_TOKEN(state, refreshToken) {
    Vue.set(state, "refreshToken", refreshToken);
  },
};

export const actions = {
  // eslint-disable-next-line camelcase
  setJfToken({ commit }, { token, refresh_token = null, refreshToken = null } = {}) {
    // eslint-disable-next-line camelcase
    refreshToken = refresh_token || refreshToken;

    commit("SET_TOKEN", token);
    commit("SET_REFRESH_TOKEN", refreshToken);

    this.$cookies.set(
      process.env.JOBFAIR_COOKIE_NAME,
      JSON.stringify({
        token,
        refreshToken,
      }),
    );
  },

  getJfToken() {
    const cookieValue = this.$cookies.get(
      process.env.JOBFAIR_COOKIE_NAME,
      {
        parseJSON: true,
      },
    );

    return cookieValue || {};
  },

  async fetchCurrentUser({ commit, dispatch }) {
    const {
      token,
    } = await dispatch("getJfToken");

    try {
      const { data } = await this.$api.$get(
        "/auth/user",
        {
          headers: {
            Authorization: `jwt ${ token }`,
          },
        },
      );

      commit("SET_USER", data);

      return data;
    } catch (e) {
      commit("SET_USER", null);

      return null;
    }
  },

  async doLogin({ commit, dispatch }, { email, password }) {
    try {
      const response = await this.$api.$post(
        "/auth/login",
        {
          email,
          password,
        },
      );

      const { data = {} } = response || {};

      await commit("SET_USER", data?.user);
      await dispatch("setJfToken", data || {});

      return response;
    } catch (e) {
      console.log(e);

      return null;
    }
  },

  async doRefreshToken({ commit, dispatch }, { token: t, refreshToken: r } = {}) {
    const { token: tb, refreshToken: rb } = await dispatch("getJfToken");
    const token = t || tb;
    const refreshToken = r || rb;

    try {
      const { data = {} } = await this.$api.$post(
        "/auth/token/refresh",
        {
          token,
          refreshToken,
        },
      );

      commit("SET_USER", data.user);
      await dispatch("setJfToken", {
        token: data.token,
        refreshToken,
      });

      return data;
    } catch (e) {
      commit("SET_USER", null);
      await dispatch("setJfToken", {
        token: null,
        refreshToken: null,
      });

      return null;
    }
  },

  async doLogout({ commit, dispatch }) {
    await dispatch("setJfToken", {});
    commit("SET_USER", null);
  },

  async nuxtServerInit({ dispatch }) {
    const {
      token,
      refreshToken,
    } = await dispatch("getJfToken");

    if (token && refreshToken) {
      const userData = await dispatch("fetchCurrentUser");
      if (!userData) {
        await dispatch("doRefreshToken");
      }
    }
  },
};
