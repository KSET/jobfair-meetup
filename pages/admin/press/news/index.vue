<template>
  <app-max-width-container>
    <v-row>
      <v-col cols="12">
        <h1>News</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-btn
          :to="{ name: 'PageAdminIndex' }"
          exact
        >
          <v-icon left>
            mdi-arrow-left
          </v-icon>
          Back
        </v-btn>
        <v-btn
          :to="{ name: 'PageAdminNewsCreate' }"
          color="success"
          exact
        >
          <v-icon left>
            mdi-newspaper-plus
          </v-icon>
          Create
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-iterator
          :items="news"
          hide-default-footer
        >
          <template v-slot:default="props">
            <v-row>
              <transition-group name="list" style="display: contents;">
                <v-col
                  v-for="item in props.items"
                  :key="item.slug"
                  cols="12"
                  md="4"
                  sm="6"
                >
                  <v-card class="pa-1">
                    <app-news-card
                      :news-item="item"
                      class="ma-3"
                    />

                    <v-card-actions>
                      <v-btn
                        :loading="item.loading"
                        color="error"
                        @click.prevent="deleteNews(item.slug)"
                      >
                        <v-icon left>
                          mdi-delete
                        </v-icon>
                        Delete
                      </v-btn>

                      <v-spacer />

                      <v-btn
                        :loading="item.loading"
                        :to="{ name: 'PageAdminNewsEdit', params: { slug: item.slug } }"
                        color="warning"
                      >
                        <v-icon left>
                          mdi-pencil
                        </v-icon>
                        Edit
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </transition-group>
            </v-row>
          </template>
        </v-data-iterator>
      </v-col>
    </v-row>
  </app-max-width-container>
</template>

<router>
name: PageAdminNewsList
</router>

<script>
  import {
    mapActions,
  } from "vuex";
  import AppMaxWidthContainer from "~/components/AppMaxWidthContainer";
  import AppNewsCard from "~/components/news/NewsCard";

  export default {
    name: "PageAdminNewsList",

    components: {
      AppNewsCard,
      AppMaxWidthContainer,
    },

    async asyncData({ store }) {
      const addProperty =
        (property, value = null) =>
          (list) =>
            list.map(
              (entry) => ({
                ...entry,
                [property]: value,
              }),
            )
      ;

      return {
        news: await store.dispatch("news/fetchNewsAll").then(addProperty("loading", false)),
      };
    },

    methods: {
      ...mapActions({
        doDeleteNews: "news/deleteNewsItem",
      }),

      async deleteNews(slug) {
        if (!window.confirm("Are you sure you want to delete that?")) {
          return false;
        }

        const news = this.news.find(({ slug: i }) => i === slug);

        news.loading = true;

        const { error, errorData } = await this.doDeleteNews({ slug });

        news.loading = false;

        if (error) {
          const err =
            errorData
              ? errorData.join("\n")
              : "Something went wrong"
          ;

          return alert(err);
        }

        this.$set(this, "news", this.news.filter((item) => item !== news));
      },
    },
  };
</script>

<style lang="scss" scoped>
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }

  .list-enter-active,
  .list-leave-active {
    transition: all .5s;
  }

  .list-enter,
  .list-leave-to {
    transform: translateY(30px);
    opacity: 0;
  }
</style>
