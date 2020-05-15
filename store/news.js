import Vue from "vue";

export const state = () => (
  {
    item: null,
  }
);

export const getters = {
  newsItem({ item }) {
    return item;
  },
};

export const mutations = {
  SET_NEWS_ITEM(state, newsItem) {
    Vue.set(state, "item", newsItem);
  },
};

export const actions = {
  async fetchNews() {
    const { data } = await this.$api.$get("/news/list");

    return data;
  },

  async fetchNewsItem({ commit, state }, slug, force = false) {
    if (!force && state.item && state.item.slug === slug) {
      return state.item;
    }

    const { data } = await this.$api.$get(`/news/item/${ slug }`);

    commit("SET_NEWS_ITEM", data);

    return data;
  },
};
