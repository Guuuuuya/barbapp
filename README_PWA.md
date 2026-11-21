# 📱 Instalar Navalha Pro no Android (PWA)

O app é uma **PWA (Progressive Web App)** — instala direto do navegador Chrome, sem loja de aplicativos.

## 1. Gerar ícones PNG (recomendado)

O ícone vetor está em `public/icon.svg`. Para o ícone ficar nítido na tela inicial do Android, gere os PNGs:

```bash
# Se o node-canvas funcionar:
node scripts/generate-icons.mjs
```

Ou abra `public/icon.svg` no navegador e salve como `icon-192.png` e `icon-512.png` na pasta `public/`.

## 2. Build e publicar

```bash
npm run build
```

O resultado fica em `dist/`. Hospede em qualquer serviço estático com **HTTPS** (obrigatório para PWA):
- Vercel, Netlify, Firebase Hosting, GitHub Pages, etc.

## 3. Instalar no celular Android

1. Abra o Chrome no Android.
2. Acesse a URL do site hospedado (ex: `https://seu-app.com`).
3. Toque nos **3 pontos (⋮)** → **"Adicionar à tela inicial"**.
4. Confirme o nome "Navalha Pro" e toque em **Adicionar**.

O app aparecerá na tela inicial como um app nativo, com ícone dourado e tema escuro.

## 4. Funciona offline

O Service Worker (`public/sw.js`) armazena em cache o app. Depois de aberto uma vez, ele abre sem internet e os dados (agendamentos, lucro, horários) continuam salvos no `localStorage` do navegador.
