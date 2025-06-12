(function($) {
  const defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  $.fn.mauGallery = function(opts) {
    const settings = $.extend({}, defaults, opts);
    const tags = [];
    /**
     * Enveloppe chaque élément avec une div Bootstrap selon le nombre de colonnes
     * ✳️ Optimisation : cette fonction remplace plusieurs conditions répétées dans la version d'origine.
     */
    const wrapInCol = (el, cols) => {
      let classes = 'item-column mb-4';
      if (typeof cols === 'number') {
        classes += ` col-${Math.ceil(12 / cols)}`;
      } else {
         // ✳️ Version responsive : chaque point de rupture (xs, sm, md, etc.)
        ['xs', 'sm', 'md', 'lg', 'xl'].forEach(size => {
          if (cols[size]) classes += ` col-${size}-${Math.ceil(12 / cols[size])}`;
        });
      }
      el.wrap(`<div class="${classes}"></div>`);
    };
    /**
     * Récupère toutes les images visibles selon le tag actif
     * ✳️ Simplification : regroupement des filtres dans une seule fonction.
     */
    const getImages = tag => {
      return $(".item-column img").filter((_, img) =>
        tag === "all" || $(img).data("gallery-tag") === tag
      ).toArray();
    };
    /**
     * Fonction unique de navigation pour aller à l'image suivante/précédente
     * ✳️ Factorisation : remplace deux fonctions (prevImage et nextImage) par une seule.
     */
    const navigateImage = dir => {
      const currentSrc = $(".lightboxImage").attr("src");
      const tag = $(".tags-bar .active-tag").data("images-toggle") || "all";
      const images = getImages(tag);
      const idx = images.findIndex(img => $(img).attr("src") === currentSrc);
      const newIdx = (idx + dir + images.length) % images.length;
      $(".lightboxImage").attr("src", $(images[newIdx]).attr("src"));
    };
    /**
     * Affiche les tags de filtre
     * ✳️ Réduction : création du HTML via une boucle simple au lieu de plusieurs blocs répétés.
     */
    const showTags = (gallery, pos, tags) => {
      let html = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      tags.forEach(tag => {
        html += `<li class="nav-item"><span class="nav-link" data-images-toggle="${tag}">${tag}</span></li>`;
      });
      const tagList = `<ul class="my-4 tags-bar nav nav-pills">${html}</ul>`;
      gallery[pos === "top" ? "prepend" : "append"](tagList);
    };
    /**
     * Crée la lightbox (modale Bootstrap)
     * ✳️ Optimisation : utilise une seule chaîne de template pour inclure ou non les flèches de navigation.
     */
    const initLightbox = (gallery, id, nav) => {
      const navHTML = nav
        ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>' +
          '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></div>'
        : '';
      const modalHTML = `
        <div class="modal fade" id="${id || 'galleryLightbox'}" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog"><div class="modal-content">
            <div class="modal-body">
              ${navHTML}
              <img class="lightboxImage img-fluid" alt="Image affichée dans la modale"/>
            </div>
          </div></div>
        </div>`;
      gallery.append(modalHTML);
    };
    /**
     * Gère tous les événements : clic image, filtres, navigation
     * ✳️ Centralisation : tous les écouteurs sont regroupés ici pour plus de clarté.
     */
    const bindListeners = () => {
      // Ouvre la lightbox si activée
      $(".gallery").on("click", ".gallery-item", function() {
        if (settings.lightBox && this.tagName === "IMG") {
          $("#" + settings.lightboxId).find(".lightboxImage").attr("src", $(this).attr("src"));
          $("#" + settings.lightboxId).modal("toggle");
        }
      });
      // Gestion des tags de filtre
      $(".gallery").on("click", ".nav-link", function() {
        if ($(this).hasClass("active-tag")) return;
        $(".active-tag").removeClass("active active-tag");
        $(this).addClass("active active-tag");

        const tag = $(this).data("images-toggle");
        $(".gallery-item").each(function() {
          const show = tag === "all" || $(this).data("gallery-tag") === tag;
          $(this).closest(".item-column").toggle(show);
        });
      });
      // Navigation dans la lightbox
      $(".gallery").on("click", ".mg-prev", () => navigateImage(-1));
      $(".gallery").on("click", ".mg-next", () => navigateImage(1));
    };
    /**
     * Traitement pour chaque galerie ciblée
     */
    return this.each(function() {
      const $gallery = $(this);
      // Ajout d'une ligne contenant les items si absente
      if (!$gallery.find(".gallery-items-row").length) {
        $gallery.append('<div class="gallery-items-row row"></div>');
      }
      // Initialisation de la lightbox si activée
      if (settings.lightBox) initLightbox($gallery, settings.lightboxId, settings.navigation);
       // Traitement de chaque item (image ou autre)
      $gallery.children(".gallery-item").each(function() {
        const $item = $(this);
        if (this.tagName === "IMG") $item.addClass("img-fluid");
        $item.appendTo($gallery.find(".gallery-items-row"));
        wrapInCol($item, settings.columns);
        // Ajout du tag s'il est unique
        const tag = $item.data("gallery-tag");
        if (settings.showTags && tag && !tags.includes(tag)) tags.push(tag);
      });
      // Affichage des tags
      if (settings.showTags) showTags($gallery, settings.tagsPosition, tags);
      // Activation des événements
      bindListeners();
      // Animation d'apparition
      $gallery.fadeIn(500);
    });
  };
})(jQuery);
