/*slideshow functionality*/
let slideIndex = 1;

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");

    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function autoSlide() {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}

    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex-1].style.display = "flex";
    dots[slideIndex-1].className += " active";
    setTimeout(autoSlide, 5000); // Change image every 3 seconds
}

document.addEventListener("DOMContentLoaded", function() {
    showSlides(slideIndex = 1); // Show the first slide on page load
    autoSlide(); // Start the automatic slideshow
});
function redirectTo(imageName) {
    let url;
    switch (imageName) {
      case 'front1.jpg':
        url = 'https://cbseitms.rcil.gov.in/nvs/Index';
        break;
      case 'front3.jpg':
        url = 'https://www.navodaya.gov.in';
        break;
      case 'front2.jpg':
        url = 'https://www.benavodayan.in/subscribe.html';
        break;
      default:
        url = '#'; // Default URL if no match is found
    }
    window.location.href = url;
  }