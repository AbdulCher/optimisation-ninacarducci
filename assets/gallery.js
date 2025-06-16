document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll("#gallery-filters button");
  const images = document.querySelectorAll(".gallery-item");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Mise à jour bouton actif
      filterButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      const filter = button.getAttribute("data-filter");

      images.forEach(img => {
        const tag = img.getAttribute("data-gallery-tag");
        if (filter === "all" || tag === filter) {
          img.parentElement.style.display = "block";
        } else {
          img.parentElement.style.display = "none";
        }
      });
    });
  });
});
