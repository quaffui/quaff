<script lang="ts">
  import { QDocs, QDocsSection } from "$docs";
  import { pageTitle } from "$helpers/pageTitle";
  import {
    QAvatar,
    QBtn,
    QBtnToggle,
    QCard,
    QChip,
    QCodeBlock,
    QDrawer,
    QHeader,
    QHeaderTitle,
    QIcon,
    QIconBtn,
    QInput,
    QItem,
    QItemSection,
    QLayout,
    QList,
    QMenu,
    QNavItem,
  } from "$lib";

  const COPY = {
    en: {
      brand: "Rihla",
      boarding: "Boarding pass",
      riyadh: "Riyadh",
      dubai: "Dubai",
      trips: "My trips",
      tickets: "Tickets",
      saved: "Saved trips",
      upcoming: "Your next trip",
      date: "Tomorrow · 12 October",
      confirmed: "Confirmed",
      departure: "Departure",
      gate: "Gate",
      seat: "Seat",
      reference: "Booking reference",
      viewTicket: "View ticket",
      navigation: "Open navigation",
      close: "Close navigation",
      traveler: "Layla Nasser",
      empty: "Keep your next adventure here",
      save: "Save trip",
      unsave: "Remove saved trip",
      savedMessage: "Trip saved",
      details: "Booking details",
      hideDetails: "Hide booking details",
      actions: "Trip options",
      name: "Full name",
      email: "Email",
      updates: "Flight updates",
      profile: "Traveler details",
      profileHint: "Use the name on your passport.",
      language: "Language",
    },
    ar: {
      brand: "رحلة",
      boarding: "بطاقة الصعود",
      riyadh: "الرياض",
      dubai: "دبي",
      trips: "رحلاتي",
      tickets: "التذاكر",
      saved: "الرحلات المحفوظة",
      upcoming: "رحلتك القادمة",
      date: "غدًا · ١٢ أكتوبر",
      confirmed: "مؤكدة",
      departure: "المغادرة",
      gate: "البوابة",
      seat: "المقعد",
      reference: "رقم الحجز",
      viewTicket: "عرض التذكرة",
      navigation: "فتح القائمة",
      close: "إغلاق القائمة",
      traveler: "ليلى ناصر",
      empty: "احتفظ برحلتك القادمة هنا",
      save: "حفظ الرحلة",
      unsave: "إزالة الرحلة المحفوظة",
      savedMessage: "تم حفظ الرحلة",
      details: "تفاصيل الحجز",
      hideDetails: "إخفاء تفاصيل الحجز",
      actions: "خيارات الرحلة",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      updates: "تحديثات الرحلة",
      profile: "بيانات المسافر",
      profileHint: "استخدم الاسم الوارد في جواز سفرك.",
      language: "اللغة",
    },
  };

  let language = $state("ar");
  let drawerOpen = $state(false);
  let destination = $state<"trips" | "tickets" | "saved">("trips");
  let saved = $state(false);
  let menuOpen = $state(false);
  let showDetails = $state(false);
  let fullName = $state("ليلى ناصر");
  let email = $state("layla@example.com");
  let updates = $state(true);
  const rtl = $derived(language === "ar");
  const direction = $derived(rtl ? "rtl" : "ltr");
  const copy = $derived(rtl ? COPY.ar : COPY.en);

  function navigate(value: typeof destination) {
    destination = value;
    drawerOpen = false;
  }
</script>

<svelte:head>
  <title>{pageTitle("Right-to-left layouts")}</title>
</svelte:head>

{#snippet languagePicker(label = "Preview language")}
  <QBtnToggle
    bind:value={language}
    options={[
      { label: "العربية", value: "ar" },
      { label: "English", value: "en" },
    ]}
    aria-label={label}
    dir="ltr"
    expressive={false}
  />
{/snippet}

{#snippet route()}
  <div class="flight-route" aria-label={`${copy.riyadh} – ${copy.dubai}`}>
    <div class="route-stop">
      <strong class="airport-code"><bdi dir="ltr">RUH</bdi></strong>
      <span class="body-medium">{copy.riyadh}</span>
    </div>
    <div class="route-line" aria-hidden="true">
      <QIcon name={rtl ? "arrow_back" : "arrow_forward"} size="24px" />
    </div>
    <div class="route-stop">
      <strong class="airport-code"><bdi dir="ltr">DXB</bdi></strong>
      <span class="body-medium">{copy.dubai}</span>
    </div>
  </div>
{/snippet}

{#snippet ticketDetails()}
  <dl class="ticket-details body-medium">
    <div>
      <dt>{copy.departure}</dt>
      <dd><bdi dir="ltr">08:30</bdi></dd>
    </div>
    <div>
      <dt>{copy.gate}</dt>
      <dd><bdi dir="ltr">B12</bdi></dd>
    </div>
    <div>
      <dt>{copy.seat}</dt>
      <dd><bdi dir="ltr">18A</bdi></dd>
    </div>
  </dl>
{/snippet}

<QDocs docName="Right-to-left layouts" docDescription="Make room for both reading directions.">
  {#snippet display()}
    <div class="hero-preview">
      <div class="boarding-pass surface" dir={direction} lang={language}>
        <div class="brand-row">
          <span class="brand-mark primary-container"
            ><QIcon name="flight_takeoff" aria-hidden="true" /></span
          >
          <strong class="title-medium">{copy.brand}</strong>
          <span class="body-small text-on-surface-variant">{copy.boarding}</span>
        </div>
        {@render route()}
        <div class="ticket-stub body-medium">
          <span>{copy.traveler}</span>
          <bdi dir="ltr" class="label-large">RH 204</bdi>
        </div>
      </div>
      <div class="hero-language">{@render languagePicker()}</div>
    </div>
  {/snippet}

  {#snippet usage()}
    <QDocsSection title="Navigation" noCode>
      {#snippet sectionDescription()}
        Open Rihla's drawer, then switch languages. <code>side="start"</code> follows the reading
        direction; explicit <code>left</code>/<code>right</code> sides stay fixed.
      {/snippet}
      <div class="example-controls">
        {@render languagePicker()}
        <QBtn
          variant="flat"
          icon="menu_open"
          label="Open drawer"
          onclick={() => (drawerOpen = true)}
        />
      </div>
      <div class="travel-frame">
        <QLayout id="rtl-layout-demo" dir={direction} lang={language} class="surface-container-low">
          {#snippet header()}
            <QHeader bordered>
              <QIconBtn
                icon="menu"
                variant="flat"
                aria-label={copy.navigation}
                aria-expanded={drawerOpen}
                aria-controls="rtl-travel-drawer"
                onclick={() => (drawerOpen = !drawerOpen)}
              />
              <QHeaderTitle class="justify-start">{copy.brand}</QHeaderTitle>
              <QAvatar size="xs" class="secondary-container" aria-label={copy.traveler}
                >{rtl ? "لن" : "LN"}</QAvatar
              >
            </QHeader>
          {/snippet}
          {#snippet drawerStart()}
            <QDrawer
              id="rtl-travel-drawer"
              bind:value={drawerOpen}
              side="start"
              width={280}
              behavior="desktop"
              overlay
              persistent
              inert={!drawerOpen}
            >
              <div class="drawer-heading">
                <strong class="title-large">{copy.brand}</strong>
                <QIconBtn
                  icon="close"
                  variant="flat"
                  aria-label={copy.close}
                  onclick={() => (drawerOpen = false)}
                />
              </div>
              <QList tag="nav" aria-label={copy.brand} expressive={false} preserveTabOrder>
                <QNavItem
                  icon="luggage"
                  label={copy.trips}
                  active={destination === "trips"}
                  onclick={() => navigate("trips")}
                />
                <QNavItem
                  icon="confirmation_number"
                  label={copy.tickets}
                  active={destination === "tickets"}
                  onclick={() => navigate("tickets")}
                />
                <QNavItem
                  icon="bookmark"
                  label={copy.saved}
                  active={destination === "saved"}
                  onclick={() => navigate("saved")}
                />
              </QList>
              <div class="drawer-profile body-medium">
                <QAvatar class="tertiary-container" size="sm" aria-hidden="true"
                  >{rtl ? "لن" : "LN"}</QAvatar
                >
                <span>{copy.traveler}</span>
              </div>
            </QDrawer>
          {/snippet}
          <div class="travel-content">
            <div class="section-heading">
              <div>
                <div class="label-medium text-on-surface-variant">{copy.brand}</div>
                <h6 class="headline-small q-mt-xs q-mb-none">{copy[destination]}</h6>
              </div>
              <QIcon name="travel_explore" class="text-tertiary" size="40px" aria-hidden="true" />
            </div>
            {#if destination === "saved" && !saved}
              <div class="empty-trips">
                <QIcon name="bookmark" size="40px" class="text-primary" aria-hidden="true" />
                <p class="body-large">{copy.empty}</p>
                <QBtn
                  variant="tonal"
                  icon="bookmark_add"
                  label={copy.save}
                  onclick={() => (saved = true)}
                />
              </div>
            {:else}
              <QCard class="itinerary-card" bordered>
                <div class="trip-banner secondary-container">
                  <div class="brand-row">
                    <span class="label-large"
                      >{destination === "tickets" ? copy.boarding : copy.upcoming}</span
                    >
                    <span class="status body-small"
                      ><QIcon
                        name="check_circle"
                        size="18px"
                        aria-hidden="true"
                      />{copy.confirmed}</span
                    >
                  </div>
                  {@render route()}
                </div>
                <div class="trip-body">
                  {#if destination === "tickets"}
                    {@render ticketDetails()}
                    <div class="ticket-stub body-medium">
                      <span>{copy.reference}</span><bdi dir="ltr">RH7K2Q</bdi>
                    </div>
                  {:else}
                    <div class="trip-actions">
                      <div class="body-medium">
                        <div>{copy.date}</div>
                        <bdi dir="ltr" class="title-medium">08:30 – 11:20</bdi>
                      </div>
                      <QBtn
                        variant="tonal"
                        label={copy.viewTicket}
                        onclick={() => (destination = "tickets")}
                      />
                    </div>
                  {/if}
                </div>
              </QCard>
            {/if}
          </div>
        </QLayout>
      </div>
      <QCodeBlock
        language="svelte"
        copiable
        code={`<QLayout dir={rtl ? "rtl" : "ltr"}>
  {#snippet drawerStart()}
    <QDrawer side="start" bind:value={open} width={280} overlay>
      <QList>
        <QNavItem icon="luggage" label={labels.trips} />
      </QList>
    </QDrawer>
  {/snippet}
  <!-- Page content -->
</QLayout>`}
      />
    </QDocsSection>

    <QDocsSection title="Mixed-direction text" noCode>
      {#snippet sectionDescription()}
        Names can use <code>dir="auto"</code>. Keep email addresses and booking codes LTR with
        <code>dir="ltr"</code> or <code>bdi</code>.
      {/snippet}
      <div class="example-controls">{@render languagePicker()}</div>
      <div
        id="rtl-local-demo"
        class="traveler-card surface-container-low"
        dir={direction}
        lang={language}
      >
        <div class="section-heading">
          <div>
            <h6 class="title-large q-ma-none">{copy.profile}</h6>
            <p class="body-medium text-on-surface-variant q-mt-xs q-mb-none">{copy.profileHint}</p>
          </div>
          <QIcon name="badge" size="32px" class="text-tertiary" aria-hidden="true" />
        </div>
        <QInput bind:value={fullName} label={copy.name} dir="auto" outlined />
        <QInput bind:value={email} type="email" label={copy.email} dir="ltr" outlined />
        <div class="trip-actions">
          <QChip kind="filter" icon="notifications" label={copy.updates} bind:selected={updates} />
          <span class="body-medium">{copy.reference}: <bdi dir="ltr">RH7K2Q</bdi></span>
        </div>
      </div>
      <QCodeBlock
        language="svelte"
        copiable
        code={`<div dir="rtl" lang="ar">
  <QInput label="الاسم الكامل" dir="auto" bind:value={name} />
  <QInput label="البريد الإلكتروني" dir="ltr" type="email" bind:value={email} />
  <span>رقم الحجز: <bdi dir="ltr">RH7K2Q</bdi></span>
</div>`}
      />
    </QDocsSection>

    <QDocsSection title="Popup direction" noCode>
      {#snippet sectionDescription()}
        Open the trip options and change language inside the menu. Reactive <code>dir</code>/<code
          >lang</code
        >
        props keep an open popup in sync with local changes.
      {/snippet}
      <div class="booking-summary surface-container-low" dir={direction} lang={language}>
        <span class="brand-mark tertiary-container"><QIcon name="flight" aria-hidden="true" /></span
        >
        <div class="booking-title">
          <h6 class="title-medium q-ma-none">{copy.riyadh} – {copy.dubai}</h6>
          <span class="body-medium text-on-surface-variant"
            >{copy.reference}: <bdi dir="ltr">RH7K2Q</bdi></span
          >
        </div>
        <QBtn
          id="rtl-menu-trigger"
          label={copy.actions}
          icon="more_vert"
          variant="flat"
          aria-label={copy.actions}
          aria-expanded={menuOpen}
          onclick={() => (menuOpen = !menuOpen)}
        >
          <QMenu
            id="rtl-menu-demo"
            bind:value={menuOpen}
            dir={direction}
            lang={language}
            autoClose={false}
            anchor="bottom end"
            self="top end"
          >
            <div class="menu-language">
              <span class="label-medium">{copy.language}</span>{@render languagePicker(
                copy.language
              )}
            </div>
            <QList>
              <QItem clickable onclick={() => (saved = !saved)}>
                <QItemSection type="icon"
                  ><QIcon name={saved ? "bookmark_remove" : "bookmark_add"} /></QItemSection
                >
                <QItemSection>{saved ? copy.unsave : copy.save}</QItemSection>
              </QItem>
              <QItem
                clickable
                onclick={() => {
                  showDetails = !showDetails;
                  menuOpen = false;
                }}
              >
                <QItemSection type="icon"><QIcon name="confirmation_number" /></QItemSection>
                <QItemSection>{showDetails ? copy.hideDetails : copy.details}</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
        <div class="booking-status body-small text-primary" role="status">
          {saved ? copy.savedMessage : ""}
        </div>
        {#if showDetails}<div class="booking-details">{@render ticketDetails()}</div>{/if}
      </div>
      <QCodeBlock
        language="svelte"
        copiable
        code={`<QMenu dir={rtl ? "rtl" : "ltr"} lang={language}
  anchor="bottom end" self="top end" bind:value={open}>
  <!-- Trip options -->
</QMenu>`}
      />
      <p class="body-medium">
        Popups inherit their trigger's direction when opening. Global <code>config.rtl</code> changes
        also update open popups.
      </p>
    </QDocsSection>

    <QDocsSection title="App setup" noCode>
      {#snippet sectionDescription()}
        Call <code>Quaff.init()</code> once in your root layout. Use a plain object for fixed
        settings, or <code>$state</code> for a language switcher.
      {/snippet}
      <QCodeBlock
        language="ts"
        copiable
        code={`import { Quaff } from "@quaffui/quaff";

Quaff.init({ rtl: true });`}
      />
      <p class="body-medium">For runtime changes, use this setup instead:</p>
      <QCodeBlock
        language="ts"
        copiable
        code={`const config = $state({ rtl: true });
Quaff.init(config);

// When the language changes:
config.rtl = false;`}
      />
      <p class="body-medium">
        For SSR, set the matching initial <code>dir</code> and <code>lang</code> on
        <code>html</code>. Language packs do not set these attributes. The same reactive pattern
        works for other Quaff settings.
      </p>
      <QCodeBlock language="html" copiable code="<html lang=&quot;ar&quot; dir=&quot;rtl&quot;>" />
    </QDocsSection>
  {/snippet}
</QDocs>

<style>
  :global(.q-docs__preview:has(.hero-preview)) {
    min-height: max(400px, 24rem) !important;
  }
  .hero-preview {
    width: 100%;
    max-width: 360px;
  }
  .boarding-pass {
    padding: 20px;
    border-radius: 20px;
    box-shadow: var(--elevate2);
  }
  .hero-language {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  .hero-language :global(.q-btn-group) {
    background: var(--surface);
    border-radius: 28px;
  }
  .brand-row,
  .section-heading,
  .trip-actions,
  .ticket-stub,
  .drawer-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .brand-row {
    flex-wrap: wrap;
  }
  .brand-mark {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    flex-shrink: 0;
  }
  .flight-route {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 56px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
    padding-block: 24px;
  }
  .route-stop {
    display: grid;
    gap: 4px;
  }
  .route-stop:last-child {
    text-align: end;
  }
  .airport-code {
    font-size: 2rem;
    line-height: 1.2;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .route-line,
  .ticket-stub,
  .drawer-profile,
  .booking-details {
    border-radius: 0;
  }
  .route-line {
    border-block-end: 1px dashed var(--outline);
    text-align: center;
    padding-block-end: 8px;
  }
  .ticket-stub {
    flex-wrap: wrap;
    border-block-start: 1px dashed var(--outline-variant);
    padding-block-start: 16px;
  }
  .example-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-block-end: 16px;
  }
  .travel-frame {
    height: 440px;
    max-width: 800px;
    border: 1px solid var(--outline-variant);
    border-radius: 20px;
    overflow: hidden;
  }
  .drawer-heading {
    padding-inline-start: 16px;
    margin-block-end: 16px;
  }
  .drawer-profile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 16px;
    margin-block-start: 24px;
    border-block-start: 1px solid var(--outline-variant);
  }
  .travel-content {
    padding: 24px;
  }
  .section-heading {
    margin-block-end: 24px;
  }
  .section-heading > div {
    min-width: 0;
  }
  .section-heading :global(.q-icon) {
    flex-shrink: 0;
  }
  :global(.itinerary-card) {
    max-width: 560px;
    padding: 0;
    overflow: hidden;
  }
  .trip-banner {
    border-radius: 0;
    padding: 20px 24px 0;
  }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .trip-body {
    padding: 20px 24px;
  }
  .trip-actions {
    flex-wrap: wrap;
  }
  .ticket-details {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin: 0;
  }
  .ticket-details dt {
    color: var(--on-surface-variant);
  }
  .ticket-details dd {
    margin: 4px 0 0;
    font-weight: 500;
  }
  .trip-body .ticket-stub {
    margin-block-start: 20px;
  }
  .empty-trips {
    text-align: center;
    padding: 24px 8px;
  }
  .traveler-card {
    display: grid;
    gap: 20px;
    max-width: 560px;
    padding: 24px;
    border-radius: 20px;
  }
  .traveler-card .section-heading {
    margin: 0;
  }
  .booking-summary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    max-width: 560px;
    padding: 20px;
    border-radius: 20px;
  }
  .booking-title {
    flex: 1 1 160px;
    min-width: 0;
  }
  .booking-status {
    flex-basis: 100%;
  }
  .booking-status:empty {
    display: none;
  }
  .booking-details {
    flex-basis: 100%;
    padding-block-start: 16px;
    border-block-start: 1px solid var(--outline-variant);
  }
  .menu-language {
    display: grid;
    gap: 12px;
    padding: 16px;
  }
  :global(#rtl-menu-demo) {
    width: 296px;
  }
  .travel-frame,
  .traveler-card,
  .boarding-pass {
    container-type: inline-size;
  }
  @container (max-width: 14em) {
    .flight-route {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .route-stop {
      min-width: max-content;
      text-align: start;
    }
    .route-line {
      display: none;
    }
  }
  @container (max-width: 360px) {
    .flight-route {
      grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr);
      gap: 8px;
    }
    .airport-code {
      font-size: 1.5rem;
    }
    .trip-banner,
    .trip-body {
      padding-inline: 16px;
    }
    .travel-content {
      padding: 16px;
    }
    .ticket-details {
      grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    }
  }
</style>
