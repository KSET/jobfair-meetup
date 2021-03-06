<template>
  <v-footer absolute app dark>
    <v-container :class="$style.container" fluid>
      <v-row v-if="showLogos" :class="$style.hideOnSmall">
        <v-col>
          <h1 :class="$style.organizatori">
            <translated-text trans-key="footer.organisers" />
          </h1>
        </v-col>
      </v-row>
      <v-row v-if="showLogos" :class="[ $style.logoRow, $style.hideOnSmall ]">
        <v-col
          v-for="logo in logos"
          :key="logo.src"

          :class="$style.logoCol"
          class="text-center"

          cols="6"
          md="3"
        >
          <img
            :alt="logo.name"
            :class="$style.logo"
            :src="logo.src"
            :style="{ 'height': logo.height }"
          >
        </v-col>
      </v-row>
      <v-row v-if="showLogos" :class="$style.hideOnSmall">
        <v-divider :class="$style.spacer" />
      </v-row>
      <v-row :class="$style.bottomPart">
        <v-col
          cols="6"
          md="6"
          order="3"
          order-md="1"
        >
          <img
            :class="$style.jobfairLogo"
            alt="Job Fair Meetup"
            src="../assets/images/logo/jobfair-mono.png"
          >
          <div :class="$style.afterJobfairText">
            <translated-text trans-key="footer.legal.kset" /> &copy; {{ (new Date).getFullYear() }}
          </div>
          <div :class="$style.afterJobfairText">
            <translated-text trans-key="footer.legal.allRightsReserved" />
          </div>
          <div
            v-if="!showConsent"
            :class="$style.afterJobfairText"
          >
            <translated-text
              style="cursor: pointer;"
              trans-key="footer.legal.cookiesReset"
              @click.native.prevent="clearConsent"
            />
          </div>
        </v-col>
        <v-col
          cols="6"
          md="2"
          order="1"
          order-md="2"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.qna.header" />
            </strong>
          </div>
          <div>
            <nuxt-link
              :to="{ name: 'PageQnACompanyApplications' }"
            >
              <translated-text trans-key="footer.qna.companyApplications" />
            </nuxt-link>
          </div>
        </v-col>
        <v-col
          cols="6"
          md="2"
          order="2"
          order-md="3"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.contact.header" />
            </strong>
          </div>
          <div>
            <translated-text trans-key="footer.contact.jobfair.text" />
          </div>
          <div>
            <translated-text trans-key="footer.contact.jobfair.email" />
          </div>
          <div>
            <translated-text trans-key="footer.contact.jobfair.location" />
          </div>
        </v-col>
        <v-col
          cols="6"
          md="2"
          order="4"
          order-md="4"
        >
          <div>
            <strong>
              <translated-text trans-key="footer.followUs" />
            </strong>
          </div>
          <div>
            <v-btn
              v-for="icon in socialIcons"
              :key="icon.src"

              :class="$style.socialIcon"
              :href="icon.href"
              icon
              rel="noopener noreferrer"
              small
              target="_blank"
            >
              <img
                :alt="icon.name"
                :src="icon.src"
              >
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <cookie-consent />
  </v-footer>
</template>

<script>
  import {
    mapActions,
    mapGetters,
  } from "vuex";
  import CookieConsent from "./CookieConsent";
  import TranslatedText from "~/components/TranslatedText";

  export default {
    name: "AppFooter",

    components: {
      CookieConsent,
      TranslatedText,
    },

    computed: {
      ...mapGetters({
        getSetting: "settings/getSetting",
      }),

      ...mapGetters("cookieConsent", [
        "showConsent",
      ]),

      showLogos() {
        return "Index" === this.$route.name;
      },

      logos() {
        return [
          {
            name: "FER",
            src: require("@/assets/images/logo/fer.png"),
          },
          {
            name: "Centar Karijera",
            src: require("@/assets/images/logo/ck.png"),
          },
          {
            name: "KSET",
            src: require("@/assets/images/logo/kset.png"),
          },
          {
            name: "SSFER",
            src: require("@/assets/images/logo/ssfer.png"),
            height: "9em",
          },
        ];
      },

      socialIcons() {
        return [
          {
            name: "Instagram",
            href: this.getSetting("Instagram URL"),
            src: require("@/assets/images/icons/footer/icon-ig.png"),
          },
          {
            name: "Facebook",
            href: this.getSetting("Facebook URL"),
            src: require("@/assets/images/icons/footer/icon-fb.png"),
          },
          {
            name: "Youtube",
            href: this.getSetting("Youtube URL"),
            src: require("@/assets/images/icons/footer/icon-yt.png"),
          },
          {
            name: "LinkedIn",
            href: this.getSetting("LinkedIn URL"),
            src: require("@/assets/images/icons/footer/icon-ln.png"),
          },
        ];
      },
    },

    methods: {
      ...mapActions("cookieConsent", [
        "clearConsent",
      ]),
    },
  };
</script>

<style lang="scss" module>
  @import "assets/styles/include/all";

  .container {
    width: 95%;
    max-width: $content-max-width;

    @include media(sm) {
      max-width: 100%;
    }

    a {
      text-decoration: none;
      color: $fer-white;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .organizatori {
    font-size: 2.5em;
    margin-bottom: 1em;
    text-align: center;
    color: $fer-yellow;

    @include media(sm) {
      font-size: 2em;
    }
  }

  .logoRow {
    width: 60%;
    margin: 0 auto;

    @include media(sm) {
      width: 100%;
    }

    .logoCol {
      align-self: center;

      .logo {
        height: 3em;
      }
    }
  }

  .spacer {
    border-color: rgba(255, 255, 255, .42) !important;
  }

  .bottomPart {
    font-size: 87.5%;
    margin-top: 1.5em;

    strong {
      display: block;
      margin-bottom: .3em;
    }
  }

  .jobfairLogo {
    $height: 3em;
    $aspect-ratio: 110 / 40;

    width: $height * $aspect-ratio;
    height: $height;
    margin-bottom: 1em;
  }

  .afterJobfairText {
    font-size: 90%;
    opacity: .7;
  }

  .socialIcon {
    margin-right: 1.5em;

    &:last-child {
      margin-right: initial;
    }
  }

  @include media(md) {

    .hideOnSmall {
      display: none;
    }

  }
</style>
