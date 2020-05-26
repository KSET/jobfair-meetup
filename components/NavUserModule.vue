<template>
  <div
    :class="{
      [$style.userContainer]: true,
      [$style.hidden]: !user,
    }"
  >
    <v-menu
      v-if="user"
      v-model="userOpen"
      :close-on-content-click="false"
      offset-y
      transition="scroll-y-transition"
    >
      <template #activator="{ on }">
        <a
          :class="$style.navLink"
          v-on="on"
        >
          <span :class="$style.navLinkText" v-text="user.name" />
          <v-icon
            :class="{
              [$style.navLinkIcon]: true,
              [$style.navLinkOpen]: userOpen,
            }"
            class="ml-1"
            dense
          >
            mdi-chevron-down
          </v-icon>
        </a>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title v-text="user.name" />
              <v-list-item-subtitle v-text="user.email" />
            </v-list-item-content>
          </v-list-item>

          <v-divider v-if="user.companies.length" />

          <v-list-item v-if="user.companies.length">
            <v-list subheader>
              <v-subheader>
                <translated-text trans-key="nav.user.company.memberOf" />
              </v-subheader>

              <v-list-item
                v-for="company in user.companies"
                :key="company.id"
              >
                <v-list-item-avatar :data-srcset="getSrcSet(company.logo)">
                  <v-img
                    :lazy-src="company.logo.small.url"
                    :src="company.logo.original.url"
                    :srcset="getSrcSet(company.logo)"
                    fill
                  />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title v-text="company.brand_name" />
                  <v-list-item-subtitle v-text="company.short_description.substr(0, 50) + '...'" />
                </v-list-item-content>

                <v-list-item-action>
                  <v-list-item-action-text>
                    <v-btn color="primary">
                      <translated-text trans-key="nav.user.actions.company.enter" />
                    </v-btn>
                  </v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-list-item>
        </v-list>

        <v-divider v-if="user.role === 'admin'" />

        <v-list v-if="user.role === 'admin'" subheader>
          <v-subheader>
            <translated-text trans-key="nav.user.admin.header" />
          </v-subheader>

          <v-list-item>
            <v-list-item-action>
              <v-switch :value="isEditing" color="primary" @change="setEditing($event)" />
            </v-list-item-action>
            <v-list-item-title>
              <translated-text trans-key="nav.user.actions.admin.enableEditing" />
            </v-list-item-title>
          </v-list-item>

          <v-list-item>
            <v-btn
              :to="{ name: 'PageAdminIndex' }"
              color="primary"
            >
              <translated-text trans-key="button.adminPanel" />
            </v-btn>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer />

          <v-btn text @click="userOpen = false">
            <translated-text trans-key="actions.cancel" />
          </v-btn>
          <v-btn color="error" text @click="userOpen = logout()">
            <translated-text trans-key="actions.auth.logout" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
  import {
    mapActions,
    mapGetters,
    mapMutations,
  } from "vuex";
  import TranslatedText from "~/components/TranslatedText";
  import {
    getSrcSet,
  } from "~/helpers/image";

  export default {
    name: "NavUserModule",

    components: {
      TranslatedText,
    },

    data: () => ({
      userOpen: false,
    }),

    computed: {
      ...mapGetters({
        user: "user/getUser",
        isEditing: "translations/isEditable",
      }),
    },

    methods: {
      ...mapActions({
        doLogout: "user/doLogout",
      }),

      ...mapMutations({
        setEditing: "translations/SET_EDITABLE",
      }),

      async logout() {
        await this.doLogout();

        await this.$router.push({ name: "Index" });
      },

      getSrcSet,
    },
  };
</script>

<style lang="scss" module>
  @import "../assets/styles/include/all";

  .hidden {
    display: none;
  }

  .userContainer {
    //noinspection CssOverwrittenProperties
    display: inline-flex;
    //noinspection CssOverwrittenProperties
    display: contents;

    .navLink {
      @extend %nav-link;

      .navLinkText {
        align-self: center;
      }

      .navLinkIcon {
        transition-property: transform;
        color: inherit;
      }

      .navLinkOpen {
        transform: rotate(180deg);
      }
    }
  }
</style>