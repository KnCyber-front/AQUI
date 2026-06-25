// ============================================================
// PROTEÇÃO DE SESSÃO
// Se o usuário não estiver logado, manda de volta pro login.
// Esta função roda imediatamente ao carregar a página.
// ============================================================
(function verificarSessao() {
  const sessao = sessionStorage.getItem("logado");
  if (!sessao) {
    // Sem sessão = não logado; redireciona para o login
    window.location.href = "../pasta_login_registrar/index.html";
  }
})();

/* ==========================================================
   map.js — Lógica de mapa e geolocalização
   Fluxo principal:
     1. initMap()  → chamada automaticamente pelo Google Maps ao carregar
     2. locateMe() → chamada pelo clique do botão no HTML
   ========================================================== */


/* ----------------------------------------------------------
   VARIÁVEIS DE MÓDULO
   Ficam fora das funções para persistir entre chamadas.
   ---------------------------------------------------------- */

/** Objeto do mapa Google Maps */
let map;

/** Marcador azul que representa o usuário */
let marker;

/** Círculo que representa a precisão (raio em metros) */
let accuracyCircle;


/* ----------------------------------------------------------
   1. initMap()
   Esta função é chamada AUTOMATICAMENTE pelo SDK do Google Maps
   após o script da API terminar de carregar (ver parâmetro
   "callback=initMap" na tag <script> do index.html).

   Ela cria o mapa em estado inicial (centralizado no Brasil)
   e aguarda o usuário clicar em "Localizar-me".
   ---------------------------------------------------------- */
function initMap() {
  // Posição padrão: centro aproximado do Brasil
  const defaultCenter = { lat: -14.235, lng: -51.925 };

  // new google.maps.Map(elemento, opções) cria o mapa dentro do div#map
  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 4,                      // 1 = mundo inteiro, 20 = muito próximo

    // Esquema de cores escuro (combina com nosso CSS dark)
    styles: darkMapStyles(),

    // Remove controles desnecessários para manter a tela limpa
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });
}


/* ----------------------------------------------------------
   2. locateMe()
   Chamada pelo onclick do botão no HTML.
   Usa a API de Geolocalização do navegador (navigator.geolocation)
   para obter as coordenadas do dispositivo.
   ---------------------------------------------------------- */
function locateMe() {
  // Verifica se o navegador suporta geolocalização
  if (!navigator.geolocation) {
    setStatus("Seu navegador não suporta geolocalização.", "error");
    return;
  }

  // Desabilita o botão e mostra mensagem de carregamento
  setButtonLoading(true);
  setStatus("Buscando sua localização…");

  // navigator.geolocation.getCurrentPosition(sucesso, erro, opções)
  navigator.geolocation.getCurrentPosition(
    onLocationSuccess,  // chamada quando a localização é obtida
    onLocationError,    // chamada quando ocorre um erro
    {
      enableHighAccuracy: true,   // solicita GPS se disponível (mais preciso)
      timeout: 10000,             // aguarda até 10 segundos
      maximumAge: 0,              // não usa cache — busca posição fresca
    }
  );
}


/* ----------------------------------------------------------
   3. onLocationSuccess(position)
   Recebe o objeto `position` da API do navegador com as
   coordenadas e atualiza mapa + painel de informações.
   ---------------------------------------------------------- */
function onLocationSuccess(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const acc = Math.round(position.coords.accuracy); // precisão em metros

  // Atualiza os cards de informação no HTML
  document.getElementById("lat").textContent = lat.toFixed(6);
  document.getElementById("lng").textContent = lng.toFixed(6);
  document.getElementById("acc").textContent = acc + " m";

  // Coordenadas no formato que o Google Maps entende
  const userLatLng = { lat, lng };

  // Move o centro do mapa para a posição do usuário
  map.setCenter(userLatLng);
  map.setZoom(16); // zoom de rua

  // Cria ou move o marcador
  placeMarker(userLatLng, acc);

  setStatus("✓ Localização encontrada com precisão de " + acc + " metros.", "ok");
  setButtonLoading(false);
}


/* ----------------------------------------------------------
   4. onLocationError(error)
   Trata os possíveis erros da API de Geolocalização.
   ---------------------------------------------------------- */
function onLocationError(error) {
  const messages = {
    1: "Permissão negada. Por favor, permita o acesso à localização no navegador.",
    2: "Não foi possível determinar sua posição (sinal fraco ou GPS indisponível).",
    3: "Tempo esgotado. Tente novamente.",
  };

  // error.code é 1, 2 ou 3 — usamos o objeto acima para mensagem amigável
  setStatus(messages[error.code] || "Erro desconhecido.", "error");
  setButtonLoading(false);
}


/* ----------------------------------------------------------
   5. placeMarker(latLng, accuracyMeters)
   Coloca (ou reposiciona) o marcador e o círculo de precisão no mapa.
   ---------------------------------------------------------- */
function placeMarker(latLng, accuracyMeters) {
  // Se o marcador já existe, apenas move-o; senão, cria um novo
  if (marker) {
    marker.setPosition(latLng);
  } else {
    marker = new google.maps.Marker({
      position: latLng,
      map: map,
      title: "Você está aqui",
      // Ícone personalizado usando um SVG inline (ponto azul)
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#4f8ef7",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });
  }

  // Círculo translúcido que mostra a área de incerteza da posição
  if (accuracyCircle) {
    // Se já existe, atualiza centro e raio
    accuracyCircle.setCenter(latLng);
    accuracyCircle.setRadius(accuracyMeters);
  } else {
    accuracyCircle = new google.maps.Circle({
      map: map,
      center: latLng,
      radius: accuracyMeters,       // raio em metros
      fillColor: "#4f8ef7",
      fillOpacity: 0.12,
      strokeColor: "#4f8ef7",
      strokeOpacity: 0.4,
      strokeWeight: 1,
    });
  }
}


/* ----------------------------------------------------------
   6. setStatus(mensagem, tipo)
   Utilitário: atualiza o texto e a classe de cor do #status.
   tipo pode ser "ok", "error" ou omitido (neutro).
   ---------------------------------------------------------- */
function setStatus(message, type = "") {
  const el = document.getElementById("status");
  el.textContent = message;
  el.className = "status-msg " + type; // aplica .ok ou .error do CSS
}


/* ----------------------------------------------------------
   7. setButtonLoading(loading)
   Utilitário: desabilita/habilita o botão durante a busca.
   ---------------------------------------------------------- */
function setButtonLoading(loading) {
  const btn = document.querySelector(".btn-locate");
  btn.disabled = loading;
  btn.querySelector(".btn-locate__icon").textContent = loading ? "" : "";
}


/* ----------------------------------------------------------
   8. darkMapStyles()
   Retorna o array de estilos que deixa o mapa com tema escuro,
   combinando com o design dark da página.
   (Gerado com o Google Maps Styling Wizard)
   ---------------------------------------------------------- */
function darkMapStyles() {
  return [
    { elementType: "geometry",       stylers: [{ color: "#1a1d27" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0f1117" }] },
    { elementType: "labels.text.fill",   stylers: [{ color: "#6b7280" }] },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2a2d3a" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#0f1117" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca3af" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#374151" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0d1520" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4b5563" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#1f2330" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#1a2b20" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#1e2130" }],
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#374151" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4b5563" }],
    },
  ];
}


/* ----------------------------------------------------------
   sair()
   Chamada pelo botão "Sair" no header.
   Remove a sessão e redireciona para o login.
   ---------------------------------------------------------- */
function sair() {
  sessionStorage.removeItem("logado");
  window.location.href = "../pasta_login_registrar/index.html";
}
