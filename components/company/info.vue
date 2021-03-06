<template>
  <div :class="$style.container">
    <v-row>
      <v-col cols="12" md="6">
        <h2>
          <nuxt-link :class="$style.back" :to="{ name: 'PageSudionici' }">
            <v-icon>mdi-chevron-left</v-icon>
            Svi sudionici
          </nuxt-link>
        </h2>
      </v-col>

      <v-col class="d-flex flex-column" cols="12" md="6">
        <h1
          :class="$style.company"
          v-text="company.name"
        />
      </v-col>
    </v-row>

    <v-row class="mt-n4">
      <v-col
        class="my-4 my-md-0"
        cols="10"
        md="6"
        offset="1"
        offset-md="0"
      >
        <v-img
          :lazy-src="company.thumbnail"
          :src="company.image"
          aspect-ratio="1.78"
          contain
        />
      </v-col>

      <v-col
        :class="$style.aboutContainer"
        cols="12"
        md="6"
      >
        <h2 :class="$style.subTitle">
          <translated-text trans-key="participants.event.aboutCompany" />
        </h2>
        <p
          v-text="company.description"
        />
      </v-col>

      <v-col cols="12" md="6" offset-md="6">
        <h2 :class="$style.subTitle">
          <translated-text trans-key="participants.event.company.eventList" />
        </h2>
        <v-list>
          <v-list-item
            v-for="event in company.events"
            :key="event.id"

            :to="{ name: 'PageSudioniciInfo', params: { type: event.type, id: event.id } }"
            :title="capitalize(event.type)"
            three-line
          >
            <v-list-item-avatar tile>
              <v-img
                contain
                :src="icons[event.type]"
              />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="event.title" />
              <v-list-item-subtitle>
                <span v-text="formatDate(event.occuresAt)" />
                <span v-if="event.location" v-text="'| ' + event.location" />
              </v-list-item-subtitle>
              <v-list-item-subtitle v-text="event.description" />
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </div>
</template>

<script>
  import TranslatedText from "~/components/TranslatedText";
  import {
    capitalize,
  } from "~/helpers/string";

  export default {
    name: "CompanyInfoPage",

    components: {
      TranslatedText,
    },

    props: {
      company: {
        type: Object,
        required: true,
      },
    },

    computed: {
      icons() {
        return {
          talk: require("@/assets/images/icons/talk.svg?inline"),
          workshop: require("@/assets/images/icons/workshop.svg?inline"),
          panel: require("@/assets/images/icons/panel.svg?inline"),
        };
      },
    },

    methods: {
      capitalize(str) {
        return capitalize(str);
      },

      formatDate(date) {
        return capitalize(new Date(date).toLocaleDateString("hr-HR", {
          weekday: "long",
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }));
      },
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {

    .back {
      font-size: 1rem;
      font-weight: bold;
      text-decoration: none;
      color: $fer-dark-blue;

      :global(.v-icon) {
        color: inherit;
      }
    }

    .company {
      font-size: 250%;
      font-weight: 800;
      color: $fer-dark-blue;
    }

    .aboutContainer {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .subTitle {
      font-size: 100%;
      font-weight: bold;
      margin-bottom: .5em;
      text-transform: uppercase;
      color: $fer-dark-blue;
    }
  }
</style>
