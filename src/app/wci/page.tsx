// West Coast Insanity, Haugaland Cheerleadingklubb
// Mørk navy design: #0B1829 base, #112240 surface, #1A3458 kort, #2B5CAB aksent

const SHOW_EDIT_HINTS = true;

const C = {
  bg: "#0B1829",
  surface: "#112240",
  card: "#1A3458",
  border: "rgba(255,255,255,0.08)",
  accent: "#2B5CAB",
  accentLight: "#4A9EDB",
  gold: "#E8B84B",
  white: "#FFFFFF",
  text: "rgba(255,255,255,0.9)",
  muted: "rgba(255,255,255,0.5)",
  dim: "rgba(255,255,255,0.25)",
};

export default function WCIPage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.bg, color: C.text, minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(11,24,41,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://be3974b8d8.clvaw-cdnwnd.com/6500c5d583fa52bcdc9b895595638ed9/200000261-b070bb070d/Logo%20WCI.png" alt="WCI" style={{ height: 32, filter: "brightness(0) invert(1)" }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: C.white }}>West Coast Insanity</div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Haugaland Cheerleadingklubb</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <NavLink href="#nav-hub">Lagene</NavLink>
            <NavLink href="#iaksjon">I aksjon</NavLink>
            <NavLink href="#historikk">Historikk</NavLink>
            <NavLink href="#kostnader">Kostnader</NavLink>
            <NavLink href="#samarbeid">Samarbeid</NavLink>
            <a href="https://spond.com" target="_blank" rel="noopener noreferrer"
              style={{ background: C.gold, color: "#0B1829", fontWeight: 800, fontSize: 13, padding: "9px 20px", borderRadius: 6, textDecoration: "none" }}>
              Bli med ✨
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(43,92,171,0.18) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(232,184,75,0.12)", border: `1px solid rgba(232,184,75,0.3)`, borderRadius: 20, padding: "5px 14px", marginBottom: 28, fontSize: 12, color: C.gold, fontWeight: 700, letterSpacing: "0.06em" }}>
              ✨ OVER 200 AKTIVE UTØVERE, HAUGESUND
            </div>
            <h1 style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 900, lineHeight: 1.06, marginBottom: 24, letterSpacing: "-0.025em" }}>
              Mestring og glede,{" "}
              <span style={{ color: C.accentLight }}>med cheer i hjertet</span>
            </h1>
            <p style={{ fontSize: 18, color: C.muted, lineHeight: 1.75, marginBottom: 40, maxWidth: 480 }}>
              Vi er et cheerleadinglag fra Haugalandet med plass til alle. Fra 1. klasse til juniorelite. Her møter du dedikerte trenere, et godt miljø og en sport som gir mer enn du tror.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="#nav-hub" style={{ background: C.gold, color: "#0B1829", fontWeight: 800, fontSize: 15, padding: "14px 30px", borderRadius: 6, textDecoration: "none" }}>
                Finn riktig lag
              </a>
              <a href="#samarbeid" style={{ background: C.card, color: C.white, fontWeight: 600, fontSize: 15, padding: "14px 30px", borderRadius: 6, textDecoration: "none", border: `1px solid ${C.border}` }}>
                Bli sponsor
              </a>
            </div>
            <div style={{ display: "flex", gap: 44, marginTop: 48, paddingTop: 36, borderTop: `1px solid ${C.border}` }}>
              <HeroStat number="200+" label="aktive utøvere" />
              <HeroStat number="9" label="lag" />
              <HeroStat number="19" label="trenere" />
              <HeroStat number="NM" label="nivå" />
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", background: C.surface }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://be3974b8d8.clvaw-cdnwnd.com/6500c5d583fa52bcdc9b895595638ed9/200000514-aa0d6aa0d9/Skjermbilde%202023-04-10%20kl.%2019.24.20.png" alt="West Coast Insanity" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <EditHint show={SHOW_EDIT_HINTS} label="Herobilder: sesongbilde fra trening eller stevne" />
          </div>
        </div>
      </section>

      {/* NAV HUB */}
      <section id="nav-hub" style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", marginBottom: 20 }}>Hva leter du etter?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <HubCard href="#lagene" icon="🤸" title="Lagene" desc="Finn riktig lag for barnet ditt. Fra Cheerlek til eliteutøver." color={C.accentLight} />
            <HubCard href="#stige" icon="📈" title="Veien i WCI" desc="Slik ser den typiske reisen fra nybegynner til toppidrett ut." color={C.accentLight} />
            <HubCard href="#iaksjon" icon="🎬" title="I aksjon" desc="Bilder og videoer fra hallen, stevner og alt imellom." color={C.accentLight} />
            <HubCard href="#kostnader" icon="💡" title="Kostnader" desc="Full oversikt over hva det koster å være med på hvert lag." color={C.gold} />
            <HubCard href="#foreldre" icon="👨‍👩‍👧" title="For foreldre" desc="Svar på det du lurer på, og informasjon om Spond." color={C.gold} />
            <HubCard href="#samarbeid" icon="🤝" title="Samarbeid" desc="Bli sponsor eller samarbeidspartner med WCI." color={C.gold} />
          </div>
        </div>
      </section>

      {/* OM OSS */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "60px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}>
          <ValuePillar icon="🤸" title="Turn, stunt og dans" text="WCI-treningen dekker hele spekteret: turn, stunts, pyramider, kast, dans og hopp. En sport som krever teknikk, tillit og samarbeid." />
          <ValuePillar icon="✨" title="Glitter og innsats" text="Cheer er glitter, men bak paljettene ligger timer med trening. Vi tar sporten seriøst og feirer både innsats og resultater." />
          <ValuePillar icon="🤝" title="Lag i ordets rette forstand" text="Uansett nivå er du en del av et lag. Det betyr noe i hverdagen, ikke bare på stevner. Vi bygger folk, ikke bare utøvere." />
        </div>
      </section>

      {/* VEIEN I WCI */}
      <section id="stige" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Label>Veien i WCI</Label>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, lineHeight: 1.12, marginBottom: 14, letterSpacing: "-0.015em" }}>
            Fra første hopp til internasjonale stevner
          </h2>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 600, lineHeight: 1.8, marginBottom: 56 }}>
            Alle starter et sted. Mange av toppidrettsutøverne våre begynte i Cheerlek i 1. klasse. Stigen viser hvordan veien kan se ut, men den er ikke obligatorisk. Du kan bli i breddeidrett så lenge du vil.
          </p>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 27, top: 40, bottom: 40, width: 2, background: `linear-gradient(to bottom, ${C.card}, ${C.accentLight}, ${C.gold})` }} />
            <StepRow level="Breddeidrett" teams={["Cheerlek", "Rainbow"]} ageLabel="1. til 3. klasse" color="#4A9C6A" desc="Lek, bevegelse og glede. Ingen krav om oppmøte til konkurranse. Bare moro i hallen og lokale opptredener." />
            <StepRow level="Breddeidrett med valgfri konkurranse" teams={["Stars", "White"]} ageLabel="4. og 5. klasse" color={C.accentLight} desc="Her bygger vi ferdigheter i stunt, turn og dans. Julekonkurransen i Bergen er frivillig. Ingen press, bare muligheter." />
            <StepRow level="Konkurranseidrett" teams={["Pearls", "Silver", "Ocean"]} ageLabel="Youth og Open" color="#7BAFD4" desc="Obligatorisk oppmøte, 2 til 3 treninger i uka og 3 stevner i sesongen. NM er målet, og det er fullt mulig å nå det." competitive />
            <StepRow level="Toppidretten" teams={["Navy", "Black"]} ageLabel="Youth L4 og Junior L5" color={C.gold} desc="Elite. Tre treninger pluss styrke og stunt individuelt. Nordisk, NM og EM-kvalifisering. Kontrakt med laget. Høy innsats og høy belønning." elite />
          </div>
        </div>
      </section>

      {/* LAGENE */}
      <section id="lagene" style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Label>Lagene våre</Label>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, lineHeight: 1.12, marginBottom: 8, letterSpacing: "-0.015em" }}>
            9 lag, ett miljø
          </h2>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 540, marginBottom: 56, lineHeight: 1.8 }}>
            Fra de minste i Cheerlek til eliteutøverne i Black. Alle lagene trener under samme tak og heier på hverandre.
          </p>

          <GroupBlock label="Breddeidrett" icon="🌱" color="#4A9C6A" desc="Fokus på lek, mestring og glede. Ingen konkurransekrav." cols={2}>
            <TeamCard name="Cheerlek" grade="1. og 2. klasse" level="Introduksjon" levelColor="#4A9C6A" coach="Trener: redaktør fyller inn" showCoachHint={SHOW_EDIT_HINTS} desc="Cheerleking er stedet der alt begynner. Her lærer de minste barna grunnleggende kroppsbeherskelse, bevegelse og motorikk gjennom lek. Sesongen avsluttes med lokale opptredener." cost="1 100 kr / halvår" extras={["Trenings-t-skjorte 450 kr (valgfritt)", "Stevneavgift 352 kr"]} emoji="🌈" imageHint="Bilde: Cheerlek på trening, mange farger og smil" show={SHOW_EDIT_HINTS} />
            <TeamCard name="Rainbow" grade="3. klasse" level="Mini, breddeidrett" levelColor="#4A9C6A" coach="Trener: redaktør fyller inn" showCoachHint={SHOW_EDIT_HINTS} desc="Rainbow introduserer level 1-elementer fra cheerleading: dans, turn, hopp, teamarbeid og enkle stunts. Et trygt og inkluderende miljø der utvikling skjer i eget tempo." cost="1 100 kr / halvår" extras={["Trenings-t-skjorte 450 kr (valgfritt)", "Stevneavgift 352 kr"]} emoji="🌟" imageHint="Bilde: Rainbow i drakt, fargerikt lagbilde" show={SHOW_EDIT_HINTS} />
          </GroupBlock>

          <GroupBlock label="PeeWee, valgfri konkurranse" icon="⭐" color={C.accentLight} desc="Ferdigheter i fokus. Julekonkurransen i Bergen er frivillig." cols={2}>
            <TeamCard name="Stars" grade="4. klasse" level="PeeWee, Level 1" levelColor={C.accentLight} coach="Trener: redaktør fyller inn" showCoachHint={SHOW_EDIT_HINTS} desc="Stars bygger grunnleggende og mer avanserte ferdigheter i turn, stunts, kast og pyramider. Individuell progresjon er viktig. Alle utvikler seg i sitt tempo." cost="1 400 kr / halvår" extras={["Trenings-t-skjorte 350 kr (valgfritt)", "Julekonkurranse Bergen 900 kr (frivillig)", "Stevneavgift 352 kr"]} emoji="⭐" imageHint="Bilde: Stars i aksjon, stunts og glitter" show={SHOW_EDIT_HINTS} />
            <TeamCard name="White" grade="5. klasse" level="PeeWee, Level 1 til 2" levelColor={C.accentLight} coach="Trener: redaktør fyller inn" showCoachHint={SHOW_EDIT_HINTS} desc="White viderefører og utvider ferdighetene fra Stars med mer avanserte stunts og koreografi. Frivillig deltakelse i julekonkurransen i Bergen." cost="1 400 kr / halvår" extras={["Trenings-t-skjorte 350 kr (valgfritt)", "Julekonkurranse Bergen 900 kr (frivillig)", "Stevneavgift 352 kr"]} emoji="🤍" imageHint="Bilde: White, lagbilde med drakt" show={SHOW_EDIT_HINTS} />
          </GroupBlock>

          <GroupBlock label="Konkurranselag" icon="🏆" color="#7BAFD4" desc="Obligatorisk fremmøte. 2 til 3 treninger per uke. Nasjonale stevner." cols={3} competitive>
            <TeamCard name="Pearls" grade="Youth, Level 1/2" level="Konkurranselag" levelColor="#7BAFD4" coach="Julie" showCoachHint={false} desc="Pearls er det første steget inn i det nasjonale konkurransemiljøet. To faste treninger i uka pluss en treningshelg i måneden. Tre stevner i løpet av sesongen." cost="2 000 kr / halvår" extras={["NAIF-lisens 515 kr/år", "Stevner ca. 3 500 til 4 600 kr/sesong", "Drakt og sløyfe ca. 2 000 kr"]} emoji="🫧" imageHint="Bilde: Pearls på stevne, fullt team i drakt" show={SHOW_EDIT_HINTS} competitive />
            <TeamCard name="Silver" grade="Youth, Level 2/3" level="Konkurranselag" levelColor="#7BAFD4" coach="Trener: redaktør fyller inn" showCoachHint={SHOW_EDIT_HINTS} desc="Silver tar det et hakk opp fra Pearls med høyere level og mer krevende koreografi. Samme strukturen: to treninger, månedlig helgesamling, tre stevner." cost="2 000 kr / halvår" extras={["NAIF-lisens 515 kr/år", "Stevner ca. 3 500 til 4 600 kr/sesong", "Drakt og sløyfe ca. 2 000 kr"]} emoji="🥈" imageHint="Bilde: Silver, stevneopptreden" show={SHOW_EDIT_HINTS} competitive />
            <TeamCard name="Ocean" grade="Open Class, Level 3/4" level="Konkurranselag" levelColor="#7BAFD4" coach="Trener: redaktør fyller inn" showCoachHint={SHOW_EDIT_HINTS} desc="Ocean konkurrerer i Open Class og deltar på Norwegian Open, Spring Open og Summit. Tre treninger i uka og krav om individuell kondisjonstrening." cost="2 400 kr / halvår" extras={["NAIF-lisens 515 kr/år", "Stevner ca. 3 500 til 4 600 kr/sesong", "Drakt og sløyfe ca. 2 000 kr"]} emoji="🌊" imageHint="Bilde: Ocean, stunt i aksjon" show={SHOW_EDIT_HINTS} competitive />
          </GroupBlock>

          <GroupBlock label="Elite" icon="🌍" color={C.gold} desc="Nordisk, NM og EM-kvalifisering. Individuelle kontrakter. Høyeste forpliktelse." cols={2} elite>
            <TeamCard name="Navy" grade="Youth All Girl, Level 4" level="Elite" levelColor={C.gold} coach="Victoria Knutsen" showCoachHint={false} desc="Navy er et av WCIs topplag med mål om sterke NM-plasseringer og EM-kvalifisering. Tre treninger pluss styrke og stunt individuelt. Kontrakt med laget." cost="2 400 kr / halvår" extras={["NAIF-lisens 515 kr/år", "Stevner 3 500 til 7 000 kr per stevne", "EM ved kvalifisering ca. 16 000 kr", "Drakt og sløyfe ca. 2 500 kr"]} emoji="⚓" imageHint="Bilde: Navy, NM-opptreden, fullt team" show={SHOW_EDIT_HINTS} elite />
            <TeamCard name="Black" grade="Junior All Girl, Level 5" level="Elite" levelColor={C.gold} coach="Victoria Knutsen" showCoachHint={false} desc="Black er WCIs juniorelitelag. Level 5 er blant det høyeste i Norge. Tre treninger pluss to styrkeøkter og stunt individuelt. Nordisk, NM og EM er sesongmålene." cost="2 400 kr / halvår" extras={["NAIF-lisens 515 kr/år", "Stevner 3 500 til 7 000 kr per stevne", "EM ved kvalifisering ca. 16 000 kr", "Drakt og sløyfe ca. 2 500 kr"]} emoji="🖤" imageHint="Bilde: Black, EM eller NM-bilde, høy energi" show={SHOW_EDIT_HINTS} elite />
          </GroupBlock>
        </div>
      </section>

      {/* I AKSJON */}
      <section id="iaksjon" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Label>I aksjon</Label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.015em" }}>
                Se oss i hallen og på scenen
              </h2>
              <p style={{ fontSize: 16, color: C.muted, marginTop: 10, lineHeight: 1.75, maxWidth: 500 }}>
                Cheer er en sport som må oppleves. Her deler trenerne bilder og videoer fra trening, stevner og alt imellom.
              </p>
            </div>
            <EditHint show={SHOW_EDIT_HINTS} label="Trenere laster opp bilder og videoer via adminpanelet" inline />
          </div>
          <VideoPlaceholder label="Fremhevet video: sett inn YouTube- eller Vimeo-lenke" show={SHOW_EDIT_HINTS} tall />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16, marginBottom: 16 }}>
            <ImagePlaceholder label="Bilde fra stevne" show={SHOW_EDIT_HINTS} emoji="🏆" tall />
            <ImagePlaceholder label="Treningsbilde, stunt eller pyramide" show={SHOW_EDIT_HINTS} emoji="🤸" tall />
            <ImagePlaceholder label="Lagbilde eller opptreden" show={SHOW_EDIT_HINTS} emoji="✨" tall />
            <ImagePlaceholder label="Bilde fra hallen" show={SHOW_EDIT_HINTS} emoji="💪" />
            <ImagePlaceholder label="Glitter og glede" show={SHOW_EDIT_HINTS} emoji="🌟" />
            <ImagePlaceholder label="Stevne eller show" show={SHOW_EDIT_HINTS} emoji="🎪" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            <VideoPlaceholder label="Video fra konkurranse" show={SHOW_EDIT_HINTS} />
            <VideoPlaceholder label="Video fra trening eller show" show={SHOW_EDIT_HINTS} />
          </div>
          <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
            <SocialBtn href="https://instagram.com/wci.cheerteam" label="Følg oss på Instagram" />
            <SocialBtn href="https://www.youtube.com/channel/UCULjMiSecATdOx6IOxWYFIg" label="Se videoer på YouTube" />
          </div>
        </div>
      </section>

      {/* HISTORIKK */}
      <section id="historikk" style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Label>Historikk</Label>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, lineHeight: 1.12, marginBottom: 14, letterSpacing: "-0.015em" }}>
            Premierer gjennom tidene
          </h2>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 560, lineHeight: 1.8, marginBottom: 56 }}>
            WCI er en ung klubb med en travel historie. Her er milepælene, resultatene og øyeblikkene som har formet oss til det vi er i dag.
          </p>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 19, top: 8, bottom: 8, width: 2, background: `linear-gradient(to bottom, ${C.card}, ${C.accent}, ${C.gold})` }} />
            <HistoryRow year="2019" title="WCI stiller for første gang" desc="Cheerleadingmiljøet på Haugaland begynner å konkurrere selvstendig. Frøet til det som skulle bli West Coast Insanity er sådd." show={SHOW_EDIT_HINTS} />
            <HistoryRow year="2021" title="West Coast Insanity stiftes" desc="1. desember 2021 blir WCI formelt etablert som selvstendig idrettslag. Over 200 utøvere finner veien til den nye klubben." show={SHOW_EDIT_HINTS} />
            <HistoryRow year="2022" title="Eget treningslokale på plass" desc="Høsten 2022 flytter WCI inn i egne lokaler på Kvalamarka 17 i Haugesund. Et hjem for trening, glitter og hardt arbeid." show={SHOW_EDIT_HINTS} imageHint="Bilde: lokaleåpning eller første trening i ny hall" />
            <HistoryRow year="2023" title="Victoria Knutsen nominert til Årets Trener" desc="Sportssjef og daglig leder Victoria Knutsen nomineres til Årets Trener 2023. Et bevis på den faglige kvaliteten i klubben." show={SHOW_EDIT_HINTS} imageHint="Bilde: Victoria og laget" highlight />
            <HistoryRow year="2024" title="" desc="" show={SHOW_EDIT_HINTS} imageHint="Bilde fra NM eller EM 2024" editable />
            <HistoryRow year="2025" title="" desc="" show={SHOW_EDIT_HINTS} imageHint="Bilde fra stevne eller mesterskap 2025" editable />
            <HistoryRow year="2026" title="" desc="" show={SHOW_EDIT_HINTS} imageHint="Bilde fra inneværende sesong" editable last />
          </div>
        </div>
      </section>

      {/* KOSTNADER */}
      <section id="kostnader" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Label>Kostnader</Label>
          <h2 style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, lineHeight: 1.12, marginBottom: 14, letterSpacing: "-0.015em" }}>
            Hva koster det?
          </h2>
          <p style={{ fontSize: 16, color: C.muted, maxWidth: 580, lineHeight: 1.8, marginBottom: 48 }}>
            Kostnadene øker med nivå og forpliktelse. For breddeidrettslag er det enkelt og rimelig. Konkurranselagene har høyere kostnader fordi det er mer reising og utstyr involvert.
          </p>
          <div style={{ overflowX: "auto", borderRadius: 12, border: `1px solid ${C.border}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.card }}>
                  <Th>Lag</Th><Th>Treningsavgift</Th><Th>Lisens og medl.</Th><Th>Stevner</Th><Th>Drakt</Th><Th align="right">Estimert totalt</Th>
                </tr>
              </thead>
              <tbody>
                <CostRow name="Cheerlek" type="Breddeidrett" fee="1 100 kr" license="100 kr" competitions="352 kr" uniform="450 kr (valgfritt)" total="ca. 1 550 kr" />
                <CostRow name="Rainbow" type="Breddeidrett" fee="1 100 kr" license="100 kr" competitions="352 kr" uniform="450 kr (valgfritt)" total="ca. 1 550 kr" />
                <CostRow name="Stars" type="PeeWee" fee="1 400 kr" license="100 kr" competitions="352 kr" uniform="350 kr" total="ca. 2 200 kr" note="+ 900 kr julekonk. (frivillig)" />
                <CostRow name="White" type="PeeWee" fee="1 400 kr" license="100 kr" competitions="352 kr" uniform="350 kr" total="ca. 2 200 kr" note="+ 900 kr julekonk. (frivillig)" />
                <CostRow name="Pearls" type="Konkurranse" fee="2 000 kr" license="615 kr" competitions="3 500 til 4 600 kr" uniform="2 000 kr" total="ca. 8 100 til 9 200 kr" highlight />
                <CostRow name="Silver" type="Konkurranse" fee="2 000 kr" license="615 kr" competitions="3 500 til 4 600 kr" uniform="2 000 kr" total="ca. 8 100 til 9 200 kr" highlight />
                <CostRow name="Ocean" type="Konkurranse" fee="2 400 kr" license="615 kr" competitions="3 500 til 4 600 kr" uniform="2 000 kr" total="ca. 8 500 til 9 600 kr" highlight />
                <CostRow name="Navy" type="Elite" fee="2 400 kr" license="615 kr" competitions="7 000 til 14 000 kr" uniform="2 500 kr" total="ca. 12 500 til 19 500 kr" note="+ EM ca. 16 000 kr ved kvalif." elite />
                <CostRow name="Black" type="Elite" fee="2 400 kr" license="615 kr" competitions="7 000 til 14 000 kr" uniform="2 500 kr" total="ca. 12 500 til 19 500 kr" note="+ EM ca. 16 000 kr ved kvalif." elite />
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: C.dim, marginTop: 14 }}>Alle priser er per halvår der ikke annet er angitt. Stevnekostnader varierer etter antall stevner og om laget kvalifiserer til internasjonale mesterskap. Tallene er veiledende og oppdateres av klubben.</p>
          <EditHint show={SHOW_EDIT_HINTS} label="Kostnader: oppdateres av redaktør hvert halvår" inline />
        </div>
      </section>

      {/* FOR FORELDRE */}
      <section id="foreldre" style={{ background: C.surface, borderTop: `1px solid ${C.border}`, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Label>For foreldre</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 64, alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.015em" }}>Det du lurer på</h2>
              <FAQ q="Kan barnet mitt begynne uten erfaring?" a="Ja, og det er faktisk det vanligste. De fleste starter i Cheerlek i 1. eller 2. klasse uten noen form for forkunnskaper. Vi bygger ferdigheter fra grunnen." />
              <FAQ q="Hvor mye trening er det?" a="Breddeidrettslag har én til to treninger i uken. Konkurranselagene har to til tre obligatoriske treninger pluss individuelle styrke- og stuntøkter." />
              <FAQ q="Er det farlig?" a="Cheer er en teknisk krevende sport, men vi prioriterer sikkerhet høyest. Alle utøvere er forsikret gjennom NAIF-lisensen. Vi følger Norges Cheerleadeforbunds regler og jobber systematisk med skadeforebygging." />
              <FAQ q="Hva er forskjellen på breddeidrett og konkurranseidrett?" a="Breddeidrettslag (Cheerlek, Rainbow, Stars, White) har ingen konkurransekrav. Bare moro, opptredener og ferdighetsbygging. Vil barnet ditt konkurrere, finnes veien videre til Pearls, Silver, Ocean, Navy og Black." />
              <FAQ q="Hva er Spond?" a="Vi bruker Spond til all kommunikasjon: treningsoversikt, fravær, beskjeder og stevnepåmelding. Last ned appen, så er du oppdatert på alt." />
              <FAQ q="Hvem er trenerne?" a="Vi har 19 trenere med NAIF-sertifisering og spesialisert kompetanse i stunt, turn og dans. Sportssjef og daglig leder er Victoria Knutsen, nominert til Årets Trener 2023." />
            </div>
            <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: C.accent, borderRadius: 12, padding: "28px" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>📱</div>
                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>Vi bruker Spond</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 20 }}>All kommunikasjon, treningsoversikt og påmelding til stevner skjer via Spond. Last ned appen og hold deg oppdatert.</p>
                <a href="https://spond.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", background: C.white, color: C.accent, fontWeight: 700, fontSize: 14, padding: "11px 24px", borderRadius: 6, textDecoration: "none" }}>Åpne Spond</a>
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Adresse</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>Kvalamarka 17<br />Haugesund</p>
              </div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px" }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Ta kontakt</h3>
                <a href="mailto:post@westcoastinsanity.com" style={{ color: C.accentLight, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>post@westcoastinsanity.com</a>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <SocialBtn href="https://instagram.com/wci.cheerteam" label="Instagram" />
                  <SocialBtn href="https://facebook.com/westcoastinsanity" label="Facebook" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAMARBEID */}
      <section id="samarbeid" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Label>Samarbeid</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
            <div>
              <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.015em" }}>
                Støtt et lag som vinner og et miljø som betyr noe
              </h2>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 20 }}>WCI har over 200 aktive utøvere og et stort og engasjert apparat av familier og supportere i Haugalandsregionen. Vi er synlige lokalt, nasjonalt og internasjonalt.</p>
              <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 32 }}>En samarbeidsavtale med oss er ikke bare synlighet. Det er en investering i unge menneskers hverdag.</p>
              <Perk text="Logo på drakter og banner" />
              <Perk text="Eksponering på nasjonale og internasjonale stevner" />
              <Perk text="Omtale i sosiale medier og på nettside" />
              <Perk text="Tilpasset etter dine ønsker og budsjett" />
              <a href="mailto:post@westcoastinsanity.com" style={{ display: "inline-block", marginTop: 32, background: C.gold, color: "#0B1829", fontWeight: 700, fontSize: 15, padding: "13px 28px", borderRadius: 6, textDecoration: "none" }}>
                📩 Send oss en e-post
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <PartnerCard title="Bidragsyter" desc="For privatpersoner eller bedrifter som ønsker å bidra uten formell avtale." perks={["Nevnt på nettsiden", "Støtter unge utøvere direkte"]} />
              <PartnerCard title="Samarbeidspartner" desc="En synlig og gjensidig avtale, tilpasset deg." perks={["Logo på drakter", "Synlighet på stevner", "Omtale i sosiale medier", "Fleksibelt innhold"]} highlight />
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px" }}>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>Vi har over 15 lokale og regionale sponsorer. Stor og liten støtte teller.</p>
                <EditHint show={SHOW_EDIT_HINTS} label="Sponsorlogoer: redaktør laster opp og administrerer" inline />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#060E1A", borderTop: `1px solid ${C.border}`, padding: "52px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 40 }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://be3974b8d8.clvaw-cdnwnd.com/6500c5d583fa52bcdc9b895595638ed9/200000261-b070bb070d/Logo%20WCI.png" alt="WCI" style={{ height: 28, filter: "brightness(0) invert(1)", marginBottom: 16 }} />
              <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.75, maxWidth: 300 }}>West Coast Insanity, Haugaland Cheerleadingklubb. Etablert 1. desember 2021. Kvalamarka 17, Haugesund.</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Sider</p>
              {["#lagene:Lagene", "#stige:Veien i WCI", "#iaksjon:I aksjon", "#historikk:Historikk", "#kostnader:Kostnader", "#foreldre:For foreldre"].map(s => {
                const [href, label] = s.split(":");
                return <FooterLink key={href} href={href} label={label} />;
              })}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.dim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Kontakt</p>
              <FooterLink href="mailto:post@westcoastinsanity.com" label="post@westcoastinsanity.com" />
              <FooterLink href="https://instagram.com/wci.cheerteam" label="Instagram" />
              <FooterLink href="https://facebook.com/westcoastinsanity" label="Facebook" />
              <FooterLink href="https://www.youtube.com/channel/UCULjMiSecATdOx6IOxWYFIg" label="YouTube" />
              <FooterLink href="https://spond.com" label="Spond" />
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: C.dim }}>© 2026 West Coast Insanity</p>
            <p style={{ fontSize: 12, color: C.dim }}>✨ Mestring og glede, med cheer i hjertet</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ---- KOMPONENTER ----

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>{children}</a>;
}

function HeroStat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>{number}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: C.accentLight, textTransform: "uppercase", marginBottom: 14 }}>{children}</p>;
}

function HubCard({ href, icon, title, desc, color }: { href: string; icon: string; title: string; desc: string; color: string }) {
  return (
    <a href={href} style={{ display: "block", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "28px 24px", textDecoration: "none", color: C.white }}>
      <div style={{ fontSize: 30, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6, color }}>{title}</div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{desc}</p>
      <div style={{ marginTop: 16, fontSize: 13, color, fontWeight: 600 }}>Se mer →</div>
    </a>
  );
}

function ValuePillar({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div>
      <div style={{ fontSize: 26, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: C.white }}>{title}</h3>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>{text}</p>
    </div>
  );
}

function StepRow({ level, teams, ageLabel, color, desc, competitive, elite }: {
  level: string; teams: string[]; ageLabel: string; color: string; desc: string; competitive?: boolean; elite?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 28, paddingBottom: 36, paddingLeft: 60, position: "relative" }}>
      <div style={{ position: "absolute", left: 19, top: 5, width: 18, height: 18, borderRadius: "50%", background: color, border: `3px solid ${C.bg}`, flexShrink: 0 }} />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: "0.06em", textTransform: "uppercase" }}>{level}</span>
          {(competitive || elite) && <span style={{ fontSize: 11, background: color, color: "#0B1829", fontWeight: 700, padding: "2px 10px", borderRadius: 12 }}>{elite ? "ELITE" : "KONKURRANSE"}</span>}
          <span style={{ fontSize: 12, color: C.muted }}>{ageLabel}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {teams.map(t => <span key={t} style={{ fontSize: 13, fontWeight: 700, background: "rgba(255,255,255,0.06)", color, padding: "4px 14px", borderRadius: 20, border: `1px solid ${color}44` }}>{t}</span>)}
        </div>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, maxWidth: 600 }}>{desc}</p>
      </div>
    </div>
  );
}

function GroupBlock({ label, icon, color, desc, cols, competitive, elite, children }: {
  label: string; icon: string; color: string; desc: string; cols: number; competitive?: boolean; elite?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: 16, color }}>{label}</span>
        {(competitive || elite) && <span style={{ fontSize: 11, background: color, color: "#0B1829", fontWeight: 700, padding: "2px 10px", borderRadius: 10 }}>{elite ? "ELITE" : "KONKURRANSE"}</span>}
        <span style={{ fontSize: 13, color: C.muted }}>{desc}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 20 }}>{children}</div>
    </div>
  );
}

function TeamCard({ name, grade, level, levelColor, coach, showCoachHint, desc, cost, extras, emoji, imageHint, show, competitive, elite }: {
  name: string; grade: string; level: string; levelColor: string; coach: string; showCoachHint: boolean;
  desc: string; cost: string; extras: string[]; emoji: string; imageHint: string; show: boolean;
  competitive?: boolean; elite?: boolean;
}) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "22px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ borderRadius: 8, height: 130, background: "rgba(255,255,255,0.04)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 44 }}>{emoji}</span>
        <EditHint show={show} label={imageHint} overlay />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <h3 style={{ fontWeight: 800, fontSize: 17, color: C.white }}>{name}</h3>
          {(competitive || elite) && <span style={{ fontSize: 10, background: levelColor, color: "#0B1829", fontWeight: 700, padding: "2px 8px", borderRadius: 8 }}>{elite ? "ELITE" : "KONKURRANSE"}</span>}
        </div>
        <p style={{ fontSize: 11, color: levelColor, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>{level} · {grade}</p>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
          {showCoachHint
            ? <span style={{ background: "rgba(232,184,75,0.15)", color: C.gold, padding: "2px 8px", borderRadius: 4, fontSize: 11, border: "1px dashed rgba(232,184,75,0.4)" }}>✏️ {coach}</span>
            : <span style={{ fontWeight: 600, color: C.muted }}>Trener: {coach}</span>
          }
        </div>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{desc}</p>
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.dim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kostnader</p>
        <p style={{ fontWeight: 700, fontSize: 14, color: C.white, marginBottom: 4 }}>{cost}</p>
        {extras.map(e => <p key={e} style={{ fontSize: 12, color: C.dim }}>+ {e}</p>)}
      </div>
    </div>
  );
}

function ImagePlaceholder({ label, show, emoji, tall }: { label: string; show: boolean; emoji: string; tall?: boolean }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, height: tall ? 200 : 150, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <span style={{ fontSize: 32 }}>{emoji}</span>
      <EditHint show={show} label={label} overlay />
    </div>
  );
}

function VideoPlaceholder({ label, show, tall }: { label: string; show: boolean; tall?: boolean }) {
  return (
    <div style={{ background: "#060E1A", border: `1px solid ${C.border}`, borderRadius: 10, height: tall ? 360 : 190, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, position: "relative", overflow: "hidden" }}>
      <div style={{ width: 52, height: 52, background: "rgba(255,255,255,0.06)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, marginLeft: 4 }}>▶</span>
      </div>
      <p style={{ fontSize: 12, color: C.muted, textAlign: "center", maxWidth: 220 }}>{label}</p>
      <EditHint show={show} label={label} overlay />
    </div>
  );
}

function HistoryRow({ year, title, desc, show, imageHint, highlight, editable, last }: {
  year: string; title: string; desc: string; show: boolean; imageHint?: string; highlight?: boolean; editable?: boolean; last?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 28, paddingBottom: last ? 0 : 36, paddingLeft: 52, position: "relative" }}>
      <div style={{ position: "absolute", left: 10, top: 4, width: 20, height: 20, borderRadius: "50%", background: highlight ? C.gold : editable ? C.card : C.accent, border: `3px solid ${C.surface}`, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: highlight ? C.gold : editable ? C.dim : C.accentLight, letterSpacing: "0.04em" }}>{year}</span>
          {highlight && <span style={{ fontSize: 10, background: C.gold, color: "#0B1829", fontWeight: 700, padding: "2px 10px", borderRadius: 10 }}>MERKEÅR</span>}
        </div>
        {editable
          ? <EditHint show={show} label={`${year}: redaktør fyller inn sesongresultater og bilde`} inline />
          : <>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: C.white }}>{title}</h3>
              {desc && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, maxWidth: 600 }}>{desc}</p>}
              {imageHint && <EditHint show={show} label={imageHint} inline />}
            </>
        }
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: "18px 0" }}>
      <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: C.white }}>{q}</p>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>{a}</p>
    </div>
  );
}

function Perk({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: C.muted, marginBottom: 10 }}>
      <span style={{ width: 18, height: 18, background: "rgba(232,184,75,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.gold, fontWeight: 700, flexShrink: 0 }}>✓</span>
      {text}
    </div>
  );
}

function PartnerCard({ title, desc, perks, highlight }: { title: string; desc: string; perks: string[]; highlight?: boolean }) {
  return (
    <div style={{ background: highlight ? C.accent : C.card, border: `1px solid ${highlight ? C.accent : C.border}`, borderRadius: 10, padding: "22px" }}>
      <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 6, color: C.white }}>{title}</h3>
      <p style={{ fontSize: 13, color: highlight ? "rgba(255,255,255,0.65)" : C.muted, lineHeight: 1.6, marginBottom: 14 }}>{desc}</p>
      {perks.map(p => (
        <div key={p} style={{ display: "flex", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.75)", alignItems: "center", marginBottom: 6 }}>
          <span style={{ color: highlight ? C.gold : C.accentLight, fontWeight: 700, fontSize: 12 }}>✓</span> {p}
        </div>
      ))}
    </div>
  );
}

function SocialBtn({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={{ background: C.card, color: C.accentLight, fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 6, textDecoration: "none", border: `1px solid ${C.border}` }}>{label}</a>;
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: "block", color: C.dim, fontSize: 13, textDecoration: "none", marginBottom: 8 }}>{label}</a>;
}

function Th({ children, align }: { children: React.ReactNode; align?: string }) {
  return <th style={{ textAlign: (align as "left" | "right") || "left", padding: "12px 16px", fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>{children}</th>;
}

function CostRow({ name, type, fee, license, competitions, uniform, total, note, highlight, elite }: {
  name: string; type: string; fee: string; license: string; competitions: string; uniform: string; total: string; note?: string; highlight?: boolean; elite?: boolean;
}) {
  const bg = elite ? "rgba(232,184,75,0.06)" : highlight ? "rgba(74,158,219,0.06)" : "transparent";
  return (
    <tr style={{ background: bg, borderBottom: `1px solid ${C.border}` }}>
      <td style={{ padding: "12px 16px" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: C.white }}>{name}</span>
        <span style={{ fontSize: 11, marginLeft: 8, color: elite ? C.gold : highlight ? C.accentLight : C.dim, background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 8, fontWeight: 600 }}>{type}</span>
      </td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted }}>{fee}</td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted }}>{license}</td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted }}>{competitions}</td>
      <td style={{ padding: "12px 16px", fontSize: 13, color: C.muted }}>{uniform}</td>
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: elite ? C.gold : C.white }}>{total}</span>
        {note && <p style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{note}</p>}
      </td>
    </tr>
  );
}

function EditHint({ show, label, inline, overlay }: { show: boolean; label: string; inline?: boolean; overlay?: boolean }) {
  if (!show) return null;
  if (overlay) {
    return (
      <div style={{ position: "absolute", inset: 0, background: "rgba(59,130,246,0.07)", border: "2px dashed rgba(99,179,237,0.5)", borderRadius: 8, display: "flex", alignItems: "flex-end", padding: 8, pointerEvents: "none" }}>
        <span style={{ background: "#3B82F6", color: "#FFF", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4 }}>✏️ {label}</span>
      </div>
    );
  }
  if (inline) {
    return <p style={{ fontSize: 11, color: "#63B3ED", marginTop: 8, padding: "4px 10px", background: "rgba(59,130,246,0.1)", borderRadius: 4, display: "inline-block", border: "1px dashed rgba(99,179,237,0.3)" }}>✏️ {label}</p>;
  }
  return (
    <div style={{ border: "1px dashed rgba(99,179,237,0.3)", borderRadius: 8, padding: "8px 12px", marginTop: 8, background: "rgba(59,130,246,0.08)" }}>
      <p style={{ fontSize: 11, color: "#63B3ED", fontWeight: 600 }}>✏️ {label}</p>
    </div>
  );
}
