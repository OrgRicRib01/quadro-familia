# Quadro da Família

Calendário, lembretes, tarefas, rotinas, aniversários, férias e almoços da família, num só sítio. Funciona no telemóvel e num tablet ou ecrã tátil na parede.

- **Agenda partilhada:** cada pessoa tem uma cor. Inclui eventos repetidos, aniversários e férias.
- **Google Calendar:** mostra os calendários de cada pessoa e envia eventos para o Google.
- **Lembretes e tarefas:** tarefas que se repetem todos os dias formam as rotinas, que dão estrelas.
- **Almoços:** plano da semana e livro de receitas. Os ingredientes de uma receita podem ir para a lista de compras.
- **Modo de parede:** seis vistas (Pessoas, Linha do tempo, Semana, Mês, Rotinas e Moldura com fotografias). Volta sozinho à vista de repouso, mantém o ecrã ligado e muda de dia com um deslizar.

Os dados ficam no **Firebase**, no plano gratuito, e só as contas Google da família têm acesso. O site é alojado no **GitHub Pages**.

> Sem o passo 2 feito, a app abre em **modo de demonstração**: dá para experimentar, mas não guarda nada.

---

## Instalação (cerca de 20 minutos, uma vez)

### 1. Criar o projeto Firebase
1. Entra em <https://console.firebase.google.com> com a tua conta Google.
2. **Adicionar projeto** → nome `quadro-familia` → podes desligar o Google Analytics → **Criar**.

### 2. Registar a app web e preencher o `config.js`
1. Na página do projeto, carrega no ícone **`</>`** (Web). Dá-lhe o nome `Quadro` e não marques o Hosting.
2. Copia os valores de `firebaseConfig` que aparecem.
3. No GitHub, abre o ficheiro [`config.js`](config.js) → ✏️ **Edit** → substitui os `COLOCA_AQUI…` pelos teus valores → **Commit changes**.

### 3. Ativar a entrada com Google
1. **Authentication** → **Começar** → separador **Sign-in method** → **Google** → ativar → escolhe o email de suporte → **Guardar**.
2. Em **Authentication → Settings → Authorized domains** → **Add domain** → `orgricrib01.github.io`.

### 4. Criar a base de dados e as regras de acesso
1. **Firestore Database** → **Criar base de dados** → modo de **produção** → localização `eur3 (europe-west)`.
2. Separador **Regras** → apaga o que lá está e cola o conteúdo de [`firestore.rules`](firestore.rules).
3. **Substitui os emails de exemplo pelos da família.** Inclui as duas variantes se alguém usar `@googlemail.com`.
4. Carrega em **Publicar**.

Só quem estiver nessa lista consegue ver ou mudar alguma coisa. Para dar acesso a mais alguém, junta o email à lista e publica de novo.

### 5. Ligar o GitHub Pages
No repositório: **Settings → Pages → Build and deployment** → *Deploy from a branch* → `main` / `(root)` → **Save**.
Ao fim de 1 a 2 minutos a app fica em **<https://orgricrib01.github.io/quadro-familia/>**.

### 6. (Opcional) Google Calendar
Usa o mesmo projeto, desta vez na consola do Google Cloud.

1. Abre <https://console.cloud.google.com/apis/library/calendar-json.googleapis.com>, escolhe o projeto `quadro-familia` e carrega em **Ativar**.
2. **Google Auth Platform → Branding:** nome da app `Quadro da Família` e o teu email.
   - **Audience:** *External*, deixa em **Testing** e junta os emails da família como **Test users**.
   - **Data access → Add scopes:** `.../auth/calendar.readonly` e `.../auth/calendar.events`.
3. **Clients** (ou *APIs e serviços → Credenciais*) → abre **Web client (auto created by Google Service)**.
   - Em **Authorized JavaScript origins**, adiciona `https://orgricrib01.github.io` → **Guardar**.
   - Copia o **Client ID** para `googleClientId` no `config.js`.

Na primeira vez que alguém autorizar o Google Calendar, o Google mostra o aviso *"A Google não validou esta app"*. Como a app é só da família, carrega em **Continuar**.

---

## Primeiros passos

1. Abre a app e escolhe **Entrar com Google**.
2. **Trazer os dados do Quadro antigo:** toca no ícone das pessoas, no topo, → **Importar cópia** → escolhe o ficheiro `.json`.
3. **Google:** em **Agenda → O meu Google**, escolhe quem és e que calendários mostrar.
   - Calendários que outras pessoas partilharam contigo podem ser atribuídos a elas com **É de…**.
   - Assim, o ecrã da parede mostra a família toda com uma só conta.
4. **Ecrã de parede:** toca no ícone do ecrã, no topo, ou abre `https://orgricrib01.github.io/quadro-familia/#mural`.

### Tablet ou ecrã na parede
- **Android:** abre no Chrome → ⋮ → **Adicionar ao ecrã principal**. Para fixar a app, usa *Afixar ecrã* nas definições de segurança, ou uma app de quiosque como o Fully Kiosk Browser.
- **iPad:** abre no Safari → Partilhar → **Adicionar ao ecrã principal**. Para não sair da app, usa o *Acesso guiado*.
- Em **Ajustes** do modo de parede escolhes o **ecrã em repouso** (por exemplo a Moldura), as **fotografias** e o **prémio da semana**.

---

## Limitações conhecidas
- **Autorização do Google Calendar:** dura cerca de 1 hora. No ecrã de parede, quando expira, a sincronização fica parada até alguém tocar no ecrã. O toque renova a autorização, às vezes com uma janela do Google que fecha sozinha. Os outros dados (Firestore) atualizam sempre, em tempo real.
- **Fotografias da moldura:** são reduzidas e guardadas na base de dados. Para manter a app rápida, usa até cerca de 30.
- **Eventos enviados para o Google:** uma alteração feita depois no Quadro não muda o evento no Google.

## Estrutura

| Ficheiro | O que é |
|---|---|
| `index.html` | Página e ecrã de entrada |
| `css/style.css` | Visual da app e das seis vistas de parede |
| `js/app.js` | A app (agenda, lembretes, tarefas, almoços, modo de parede) |
| `js/backend.js` | Ligação ao Firebase (dados e entrada) e ao Google Calendar |
| `config.js` | Configuração do teu projeto Firebase / Google |
| `firestore.rules` | Quem tem acesso aos dados |

Não há passo de compilação: são ficheiros estáticos, e o GitHub Pages serve-os tal como estão.
