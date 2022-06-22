const mobileNavToggle = document.getElementById("icon-mobile-nav-toggle");
const mobileNav = document.getElementById("nav-links");
const formShorten = document.getElementById("shorten-form");
const urlInputField = document.getElementById("shorten");
const errorMsg = document.getElementById("error-msg");
const shortenedLinks = document.querySelector(".shortened-links");

function storeShortenedLink(original, shortened) {
    let existing = loadShortenedLinks();
    existing.push({ original, shortened });
    localStorage.setItem("shortenedLinks", JSON.stringify(existing));
}

function loadShortenedLinks() {
    let existing = localStorage.getItem("shortenedLinks");
    if (!existing) {
        return [];
    }

    let parsed;
    try {
        parsed = JSON.parse(existing);
    } catch (e) {
        console.error("Failed to load previously shortened links", e);
        parsed = [];
    }
    return parsed;
}

function displayMobileNav() {
    mobileNavToggle.className = "fas fa-times nav-toggle";
    mobileNav.classList.add("main-nav__ul--active");
}

function hideMobileNav() {
    mobileNavToggle.className = "fas fa-bars nav-toggle";
    mobileNav.classList.remove("main-nav__ul--active");
}

function shortenURL() {
    let shrtnURL = `https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(urlInputField.value)}`;

    document.getElementById("loader").style.display = "block";
    formShorten.classList.remove("shorten-form--empty");

    return fetch(shrtnURL).then(res => res.json()).then(data => {
        if (!data.ok) {
            console.error(data.error);
            throw new Error("ShortCode API failed");
        }
        let original = urlInputField.value;
        let shortLink = data.result.short_link;

        storeShortenedLink(original, shortLink);
        shortenedLinks.appendChild(createShortLinkRow(original, shortLink));
    }).catch(err => {
        console.error(err);
        formShorten.classList.add("shorten-form--empty");
        errorMsg.innerHTML = "Please add a valid link!";
    }).finally(() => {
        document.getElementById("loader").style.display = "none";
        urlInputField.value = "";
    });
}

function createShortLinkRow(original, shortened) {
    let result = document.createElement("div");
    result.classList.add("shortened-link");

    result.innerHTML = `
    <p class="link-to-shorten"><a class="original-link" href="${original}" target="_blank" rel="noopener">${original}</a></p>
    <hr>
    <a href="https://${shortened}" class="shortened-link" target="_blank" rel="noopener">${shortened}</a>
    <a href="#" class="btn btn--primary btn--copy" role='button'>Copy</a>`;

    return result;
}

loadShortenedLinks().map(elem => createShortLinkRow(elem.original, elem.shortened)).forEach(elem => {
    shortenedLinks.appendChild(elem);
});

shortenedLinks.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn--copy")) {
        e.preventDefault();

        e.target.classList.add("btn--copied");
        e.target.innerText = "Copied!";

        let short_url = e.target.parentElement.children[2].innerText;

        let tempInputEl = document.createElement("input");
        tempInputEl.type = "text";
        tempInputEl.value = short_url;
        document.body.appendChild(tempInputEl);

        tempInputEl.select();
        document.execCommand("Copy");

        document.body.removeChild(tempInputEl);
    }
});

mobileNavToggle.addEventListener("click", () => {
    if (mobileNavToggle.classList.contains("fa-bars")) {
        displayMobileNav();
    } else {
        hideMobileNav();
    }
});

mobileNav.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "a") {
        hideMobileNav();
    }
});

formShorten.addEventListener("submit", (e) => {
    e.preventDefault();
    shortenURL();
});