/* ==========================================================
   NEOSTORE SELLER STORE
   PART 1 — FIREBASE / AUTH / SELLER LOADING
========================================================== */

import {
    auth,
    db
} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


/* ==========================================================
   GLOBAL STORE STATE
========================================================== */

let currentUser = null;

let sellerId = "";

let sellerData = null;

let sellerCollection = "";

let storeProducts = [];

let storeReviews = [];

let productReviewsCache = {};

let selectedStoreRating = 0;


/* ==========================================================
   DOM ELEMENTS
========================================================== */

const storePage =
    document.getElementById(
        "storePage"
    );

const storeError =
    document.getElementById(
        "storeError"
    );

const storeErrorMessage =
    document.getElementById(
        "storeErrorMessage"
    );

const accountLink =
    document.getElementById(
        "accountLink"
    );


const sellerName =
    document.getElementById(
        "sellerName"
    );

const sellerDescription =
    document.getElementById(
        "sellerDescription"
    );

const sellerLocation =
    document.getElementById(
        "sellerLocation"
    );

const sellerProductCount =
    document.getElementById(
        "sellerProductCount"
    );

const sellerRating =
    document.getElementById(
        "sellerRating"
    );

const sellerVerified =
    document.getElementById(
        "sellerVerified"
    );


const contactSellerButton =
    document.getElementById(
        "contactSellerButton"
    );

const callSellerButton =
    document.getElementById(
        "callSellerButton"
    );

const whatsappSellerButton =
    document.getElementById(
        "whatsappSellerButton"
    );


const storePhoto =
    document.getElementById(
        "storePhoto"
    );

const storePhotoPlaceholder =
    document.getElementById(
        "storePhotoPlaceholder"
    );

const storeInitial =
    document.getElementById(
        "storeInitial"
    );

const storePhotoControls =
    document.getElementById(
        "storePhotoControls"
    );

const storePhotoLabel =
    document.getElementById(
        "storePhotoLabel"
    );

const storePhotoInput =
    document.getElementById(
        "storePhotoInput"
    );

const removeStorePhotoButton =
    document.getElementById(
        "removeStorePhotoButton"
    );


const storeLocationControls =
    document.getElementById(
        "storeLocationControls"
    );

const addLocationButton =
    document.getElementById(
        "addLocationButton"
    );

const updateLocationButton =
    document.getElementById(
        "updateLocationButton"
    );


const storeProductsContainer =
    document.getElementById(
        "storeProductsContainer"
    );

const productsEmpty =
    document.getElementById(
        "productsEmpty"
    );

const productResultCount =
    document.getElementById(
        "productResultCount"
    );

const productsSubtitle =
    document.getElementById(
        "productsSubtitle"
    );


const storeSearchForm =
    document.getElementById(
        "storeSearchForm"
    );

const storeSearch =
    document.getElementById(
        "storeSearch"
    );


const storeReviewForm =
    document.getElementById(
        "storeReviewForm"
    );

const storeReviewComment =
    document.getElementById(
        "storeReviewComment"
    );

const storeReviewRatingInput =
    document.getElementById(
        "storeReviewRatingInput"
    );

const storeReviewsContainer =
    document.getElementById(
        "storeReviewsContainer"
    );

const reviewsEmpty =
    document.getElementById(
        "reviewsEmpty"
    );

const reviewsAverageRating =
    document.getElementById(
        "reviewsAverageRating"
    );

const reviewsTotalCount =
    document.getElementById(
        "reviewsTotalCount"
    );


/* ==========================================================
   GET SELLER ID
========================================================== */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

sellerId =
    urlParams.get("sellerId") ||
    urlParams.get("seller") ||
    urlParams.get("id") ||
    "";

/* ==========================================================
   OPEN WHATSAPP
========================================================== */

function openSellerWhatsApp() {

    const contacts =
        getSellerContacts();


    if (!contacts.whatsapp) {

        alert(
            "This seller has not added a WhatsApp number."
        );

        return;

    }


    const productName =
        document.title
            .replace(
                "Seller Store | NeoStore",
                ""
            )
            .trim();


    const message =
        `Hello ${getSellerName()}, I found your store on NeoStore${productName ? ` and I would like to ask about your products.` : "."}`;


    const url =
        createWhatsAppURL(
            contacts.whatsapp
        ) +
        "?text=" +
        encodeURIComponent(
            message
        );


    window.open(
        url,
        "_blank",
        "noopener"
    );

}


/* ==========================================================
   AUTHENTICATION
========================================================== */

onAuthStateChanged(
    auth,
    user => {

        currentUser =
            user || null;


        if (accountLink) {

            if (currentUser) {

                accountLink.textContent =
                    "Account";

                accountLink.href =
                    "seller-dashboard.html";

            } else {

                accountLink.textContent =
                    "Login";

                accountLink.href =
                    "login.html";

            }

        }


        setupOwnerControls();

    }
);


/* ==========================================================
   PAGE START
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setFooterYear();

        setupStoreTabs();

        setupStoreSearch();

        setupStoreReviewRating();

        setupStoreReviewForm();

        setupShareStoreButton();

        setupOwnerEditing();


        if (!sellerId) {

            showStoreError(
                "No seller was selected."
            );

            return;

        }


        await loadSeller();

    },
    {
        once: true
    }
);


/* ==========================================================
   LOAD SELLER
========================================================== */

async function loadSeller() {

    try {

        let snapshot = null;


        /* --------------------------------------------------
           CHECK SELLERS COLLECTION
        -------------------------------------------------- */

        const sellerRef =
            doc(
                db,
                "sellers",
                sellerId
            );

        const sellerSnapshot =
            await getDoc(
                sellerRef
            );


        if (sellerSnapshot.exists()) {

            snapshot =
                sellerSnapshot;

            sellerCollection =
                "sellers";

        }


        /* --------------------------------------------------
           FALLBACK TO USERS COLLECTION
        -------------------------------------------------- */

        if (!snapshot) {

            const userRef =
                doc(
                    db,
                    "users",
                    sellerId
                );

            const userSnapshot =
                await getDoc(
                    userRef
                );


            if (userSnapshot.exists()) {

                snapshot =
                    userSnapshot;

                sellerCollection =
                    "users";

            }

        }


        if (!snapshot) {

            throw new Error(
                "Seller account was not found."
            );

        }


        sellerData = {

            id:
                snapshot.id,

            ...snapshot.data()

        };


        renderSeller();

        await loadSellerProducts();

        await loadStoreReviews();

        await loadSellerRating();

        await loadProductRatings();


        if (storePage) {

            storePage.hidden =
                false;

        }


        if (storeError) {

            storeError.hidden =
                true;

        }


        setupOwnerControls();

        setupContactButtons();


    } catch (error) {

        console.error(
            "LOAD SELLER ERROR:",
            error
        );


        showStoreError(
            error.message ||
            "Unable to load this seller store."
        );

    }

}


/* ==========================================================
   ERROR
========================================================== */

function showStoreError(message) {

    if (storeErrorMessage) {

        storeErrorMessage.textContent =
            message;

    }


    if (storeError) {

        storeError.hidden =
            false;

    }


    if (storePage) {

        storePage.hidden =
            true;

    }

}


/* ==========================================================
   FOOTER YEAR
========================================================== */

function setFooterYear() {

    const year =
        document.getElementById(
            "footerYear"
        );


    if (year) {

        year.textContent =
            new Date()
                .getFullYear();

    }

}


/* ==========================================================
   PART 2 — SELLER INFORMATION / PHOTO / LOCATION / CONTACT
========================================================== */


/* ==========================================================
   SELLER NAME
========================================================== */

function getSellerName() {

    return (
        sellerData?.storeName ||
        sellerData?.sellerName ||
        sellerData?.businessName ||
        sellerData?.displayName ||
        sellerData?.name ||
        sellerData?.username ||
        "Seller"
    );

}


/* ==========================================================
   RENDER SELLER
========================================================== */

function renderSeller() {

    const name =
        getSellerName();


    if (sellerName) {

        sellerName.textContent =
            name;

    }


    if (storeInitial) {

        storeInitial.textContent =
            name
                .trim()
                .charAt(0)
                .toUpperCase() ||
            "S";

    }


    if (sellerDescription) {

        sellerDescription.textContent =
            sellerData?.description ||
            sellerData?.storeDescription ||
            sellerData?.bio ||
            "Welcome to this store.";

    }


    if (sellerVerified) {

        const verified =
            sellerData?.verified === true ||
            sellerData?.isVerified === true ||
            sellerData?.sellerVerified === true;


        sellerVerified.hidden =
            !verified;

    }


    renderSellerLocation();

    renderStorePhoto();

}


/* ==========================================================
   LOCATION
========================================================== */

function renderSellerLocation() {

    if (!sellerLocation) {
        return;
    }


    const parts = [

        sellerData?.country,

        sellerData?.state,

        sellerData?.region,

        sellerData?.lga,

        sellerData?.district,

        sellerData?.city,

        sellerData?.area,

        sellerData?.street

    ];


    const uniqueParts = [];


    parts.forEach(
        part => {

            const value =
                String(
                    part || ""
                ).trim();


            if (
                value &&
                !uniqueParts.includes(
                    value
                )
            ) {

                uniqueParts.push(
                    value
                );

            }

        }
    );


    sellerLocation.textContent =
        uniqueParts.length
            ? uniqueParts.join(", ")
            : "Location unavailable";

}


/* ==========================================================
   STORE PHOTO
========================================================== */

function renderStorePhoto() {

    const photo =
        sellerData?.storePhoto ||
        sellerData?.storePhotoUrl ||
        sellerData?.profilePhoto ||
        sellerData?.photoURL ||
        sellerData?.photoUrl ||
        "";


    if (photo && storePhoto) {

        storePhoto.src =
            photo;

        storePhoto.hidden =
            false;


        if (storePhotoPlaceholder) {

            storePhotoPlaceholder.hidden =
                true;

        }

    } else {

        if (storePhoto) {

            storePhoto.hidden =
                true;

        }


        if (storePhotoPlaceholder) {

            storePhotoPlaceholder.hidden =
                false;

        }

    }

}


/* ==========================================================
   STORE OWNER
========================================================== */

function isStoreOwner() {

    return Boolean(
        currentUser &&
        sellerId &&
        currentUser.uid === sellerId
    );

}


/* ==========================================================
   OWNER CONTROLS
========================================================== */

function setupOwnerControls() {

    const owner =
        isStoreOwner();


    if (storePhotoControls) {

        storePhotoControls.hidden =
            !owner;

    }


    if (storeLocationControls) {

        storeLocationControls.hidden =
            !owner;

    }


    updatePhotoButtons();

    updateLocationButtons();

    setupOwnerContactEditor();

}


/* ==========================================================
   PHOTO BUTTONS
========================================================== */

function updatePhotoButtons() {

    if (!isStoreOwner()) {

        if (storePhotoControls) {

            storePhotoControls.hidden =
                true;

        }

        return;

    }


    if (storePhotoControls) {

        storePhotoControls.hidden =
            false;

    }


    const hasPhoto =
        Boolean(
            sellerData?.storePhoto ||
            sellerData?.storePhotoUrl ||
            sellerData?.profilePhoto ||
            sellerData?.photoURL
        );


    if (removeStorePhotoButton) {

        removeStorePhotoButton.hidden =
            !hasPhoto;

    }


    if (storePhotoLabel) {

        storePhotoLabel.textContent =
            hasPhoto
                ? "Change Store Photo"
                : "Add Store Photo";

    }

}


/* ==========================================================
   LOCATION BUTTONS
========================================================== */

function updateLocationButtons() {

    if (!isStoreOwner()) {

        return;

    }


    const hasLocation =
        Boolean(
            sellerData?.country ||
            sellerData?.state ||
            sellerData?.region ||
            sellerData?.city ||
            sellerData?.area ||
            sellerData?.street
        );


    if (addLocationButton) {

        addLocationButton.hidden =
            hasLocation;

    }


    if (updateLocationButton) {

        updateLocationButton.hidden =
            !hasLocation;

    }

}


/* ==========================================================
   SAVE SELLER DATA
========================================================== */

async function saveSellerData(data) {

    if (!sellerId) {

        throw new Error(
            "Seller ID is missing."
        );

    }


    if (!sellerCollection) {

        throw new Error(
            "Seller document location is unknown."
        );

    }


    const sellerRef =
        doc(
            db,
            sellerCollection,
            sellerId
        );


    await updateDoc(
        sellerRef,
        data
    );


    sellerData = {

        ...sellerData,
        ...data

    };

}


/* ==========================================================
   STORE PHOTO UPLOAD
========================================================== */

async function uploadStorePhoto(file) {

    if (!isStoreOwner()) {

        return;

    }


    if (!file) {

        return;

    }


    try {

        if (storePhotoLabel) {

            storePhotoLabel.textContent =
                "Uploading...";

        }


        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        formData.append(
            "upload_preset",
            "starcode"
        );


        const response =
            await fetch(
                "https://api.cloudinary.com/v1_1/diqrjgobk/image/upload",
                {
                    method: "POST",
                    body: formData
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result?.error?.message ||
                "Photo upload failed."
            );

        }


        await saveSellerData({

            storePhoto:
                result.secure_url,

            storePhotoUrl:
                result.secure_url

        });


        renderStorePhoto();

        updatePhotoButtons();


        alert(
            "Store photo updated successfully."
        );


    } catch (error) {

        console.error(
            "STORE PHOTO ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to upload store photo."
        );


    } finally {

        if (storePhotoLabel) {

            storePhotoLabel.textContent =
                "Change Store Photo";

        }

    }

}


/* ==========================================================
   REMOVE STORE PHOTO
========================================================== */

async function removeStorePhoto() {

    if (!isStoreOwner()) {

        return;

    }


    if (
        !confirm(
            "Remove your store photo?"
        )
    ) {

        return;

    }


    try {

        await saveSellerData({

            storePhoto: "",

            storePhotoUrl: ""

        });


        renderStorePhoto();

        updatePhotoButtons();


    } catch (error) {

        console.error(
            "REMOVE PHOTO ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to remove photo."
        );

    }

}


/* ==========================================================
   EDIT LOCATION
========================================================== */

async function editStoreLocation() {

    if (!isStoreOwner()) {

        return;

    }


    const country =
        prompt(
            "Country:",
            sellerData?.country || ""
        );


    if (country === null) {
        return;
    }


    const state =
        prompt(
            "State / Region:",
            sellerData?.state ||
            sellerData?.region ||
            ""
        );


    if (state === null) {
        return;
    }


    const lga =
        prompt(
            "LGA / District:",
            sellerData?.lga ||
            sellerData?.district ||
            ""
        );


    if (lga === null) {
        return;
    }


    const city =
        prompt(
            "City:",
            sellerData?.city || ""
        );


    if (city === null) {
        return;
    }


    const area =
        prompt(
            "Area:",
            sellerData?.area || ""
        );


    if (area === null) {
        return;
    }


    const street =
        prompt(
            "Street:",
            sellerData?.street || ""
        );


    if (street === null) {
        return;
    }


    try {

        await saveSellerData({

            country:
                country.trim(),

            state:
                state.trim(),

            region:
                state.trim(),

            lga:
                lga.trim(),

            district:
                lga.trim(),

            city:
                city.trim(),

            area:
                area.trim(),

            street:
                street.trim()

        });


        renderSeller();

        updateLocationButtons();


        alert(
            "Location saved successfully."
        );


    } catch (error) {

        console.error(
            "LOCATION ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to save location."
        );

    }

}


/* ==========================================================
   OWNER PHOTO / LOCATION EVENTS
========================================================== */

function setupOwnerEditing() {

    storePhotoInput?.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];

            if (file) {

                uploadStorePhoto(
                    file
                );

            }

            event.target.value =
                "";

        }
    );


    removeStorePhotoButton?.addEventListener(
        "click",
        removeStorePhoto
    );


    addLocationButton?.addEventListener(
        "click",
        editStoreLocation
    );


    updateLocationButton?.addEventListener(
        "click",
        editStoreLocation
    );

}


/* ==========================================================
   NORMALIZE PHONE
========================================================== */

function normalizeSellerPhone(number) {

    let phone =
        String(
            number || ""
        )
        .trim()
        .replace(
            /[^\d+]/g,
            ""
        );


    if (!phone) {
        return "";
    }


    if (
        phone.startsWith(
            "00"
        )
    ) {

        phone =
            "+" +
            phone.substring(2);

    }


    if (
        phone.startsWith(
            "0"
        ) &&
        sellerData?.country
            ?.toLowerCase()
            .includes("nigeria")
    ) {

        phone =
            "+234" +
            phone.substring(1);

    }


    return phone;

}


/* ==========================================================
   FIND CONTACT NUMBER
========================================================== */

function findContactNumber(
    source,
    names
) {

    if (!source) {
        return "";
    }


    for (
        const name of names
    ) {

        const value =
            source[name];


        if (
            value !== undefined &&
            value !== null &&
            String(value).trim()
        ) {

            return String(
                value
            ).trim();

        }

    }


    return "";

}


/* ==========================================================
   GET SELLER CONTACTS
========================================================== */

function getSellerContacts() {

    let whatsapp =
        findContactNumber(
            sellerData,
            [
                "whatsapp",
                "whatsappNumber",
                "whatsappPhone",
                "whatsapp_number"
            ]
        );


    let phone1 =
        findContactNumber(
            sellerData,
            [
                "phone1",
                "phoneNumber1",
                "callNumber1",
                "phone",
                "phoneNumber"
            ]
        );


    let phone2 =
        findContactNumber(
            sellerData,
            [
                "phone2",
                "phoneNumber2",
                "callNumber2"
            ]
        );


    /* --------------------------------------------------
       FALLBACK TO SELLER'S PRODUCTS
    -------------------------------------------------- */

    if (
        !whatsapp ||
        !phone1 ||
        !phone2
    ) {

        for (
            const product of storeProducts
        ) {

            if (!whatsapp) {

                whatsapp =
                    findContactNumber(
                        product,
                        [
                            "whatsapp",
                            "whatsappNumber",
                            "whatsappPhone",
                            "whatsapp_number",
                            "sellerWhatsApp",
                            "sellerWhatsapp",
                            "sellerWhatsappNumber"
                        ]
                    );

            }


            if (!phone1) {

                phone1 =
                    findContactNumber(
                        product,
                        [
                            "phone1",
                            "phoneNumber1",
                            "callNumber1",
                            "sellerPhone1",
                            "sellerPhoneNumber1",
                            "phone",
                            "phoneNumber"
                        ]
                    );

            }


            if (!phone2) {

                phone2 =
                    findContactNumber(
                        product,
                        [
                            "phone2",
                            "phoneNumber2",
                            "callNumber2",
                            "sellerPhone2",
                            "sellerPhoneNumber2"
                        ]
                    );

            }


            if (
                whatsapp &&
                phone1 &&
                phone2
            ) {

                break;

            }

        }

    }


    return {

        whatsapp:
            normalizeSellerPhone(
                whatsapp
            ),

        phone1:
            normalizeSellerPhone(
                phone1
            ),

        phone2:
            normalizeSellerPhone(
                phone2
            )

    };

}


/* ==========================================================
   PART 3 — CONTACT BUTTONS / PRODUCTS
========================================================== */


/* ==========================================================
   SETUP CONTACT BUTTONS
========================================================== */

function setupContactButtons() {

    const contacts =
        getSellerContacts();


    /* --------------------------------------------------
       CALL
    -------------------------------------------------- */

    if (callSellerButton) {

        if (
            contacts.phone1 ||
            contacts.phone2
        ) {

            callSellerButton.hidden =
                false;

            callSellerButton.href =
                "#";

        } else {

            callSellerButton.hidden =
                true;

        }

    }


    /* --------------------------------------------------
       WHATSAPP
    -------------------------------------------------- */

    if (whatsappSellerButton) {

        if (contacts.whatsapp) {

            whatsappSellerButton.hidden =
                false;

            whatsappSellerButton.href =
                createWhatsAppURL(
                    contacts.whatsapp
                );

        } else {

            whatsappSellerButton.hidden =
                true;

        }

    }

}


/* ==========================================================
   WHATSAPP URL
========================================================== */

function createWhatsAppURL(number) {

    const clean =
        String(number || "")
        .replace(
            /[^\d]/g,
            ""
        );


    if (!clean) {

        return "";

    }


    return (
        "https://wa.me/" +
        clean
    );

}





/* ==========================================================
   CALL SELLER
========================================================== */

function callSeller() {

    const contacts =
        getSellerContacts();


    const numbers =
        [
            contacts.phone1,
            contacts.phone2
        ]
        .filter(
            (value, index, array) =>
                value &&
                array.indexOf(value) === index
        );


    if (!numbers.length) {

        alert(
            "This seller has not added a call number."
        );

        return;

    }


    if (
        numbers.length === 1
    ) {

        window.location.href =
            "tel:" +
            numbers[0];

        return;

    }


    const choice =
        prompt(
            "Choose a call number:\n\n" +
            "1. " +
            numbers[0] +
            "\n" +
            "2. " +
            numbers[1] +
            "\n\n" +
            "Enter 1 or 2:"
        );


    if (
        choice === "1"
    ) {

        window.location.href =
            "tel:" +
            numbers[0];

    }


    if (
        choice === "2"
    ) {

        window.location.href =
            "tel:" +
            numbers[1];

    }

}


/* ==========================================================
   SHARE SELLER STORE
========================================================== */

async function shareSellerStore() {

    const url =
        window.location.href;


    const title =
        `${getSellerName()} | NeoStore`;


    const text =
        `Check out ${getSellerName()}'s store on NeoStore.`;


    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title,
                text,
                url

            });

            return;

        }


        if (
            navigator.clipboard
        ) {

            await navigator.clipboard.writeText(
                url
            );


            alert(
                "Store link copied. You can now share it."
            );


            return;

        }


        prompt(
            "Copy this store link:",
            url
        );


    } catch (error) {

        if (
            error?.name !==
            "AbortError"
        ) {

            console.error(
                "SHARE ERROR:",
                error
            );

        }

    }

}


/* ==========================================================
   LOAD SELLER PRODUCTS
========================================================== */

async function loadSellerProducts() {

    try {

        const queries = [

            query(
                collection(
                    db,
                    "products"
                ),
                where(
                    "sellerId",
                    "==",
                    sellerId
                )
            ),

            query(
                collection(
                    db,
                    "products"
                ),
                where(
                    "userId",
                    "==",
                    sellerId
                )
            ),

            query(
                collection(
                    db,
                    "products"
                ),
                where(
                    "uid",
                    "==",
                    sellerId
                )
            )

        ];


        const snapshots =
            await Promise.all(
                queries.map(
                    item =>
                        getDocs(item)
                )
            );


        const productMap =
            new Map();


        snapshots.forEach(
            snapshot => {

                snapshot.forEach(
                    item => {

                        if (
                            !productMap.has(
                                item.id
                            )
                        ) {

                            productMap.set(
                                item.id,
                                {
                                    id:
                                        item.id,
                                    ...item.data()
                                }
                            );

                        }

                    }
                );

            }
        );


        storeProducts =
            Array.from(
                productMap.values()
            )
            .filter(
                product =>
                    product.deleted !== true &&
                    product.isDeleted !== true
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    getProductTimestamp(b) -
                    getProductTimestamp(a)
            );


        if (sellerProductCount) {

            sellerProductCount.textContent =
                storeProducts.length;

        }


        if (productResultCount) {

            productResultCount.textContent =
                `${storeProducts.length} products`;

        }


        renderStoreProducts(
            storeProducts
        );


        setupContactButtons();


    } catch (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
            error
        );


        storeProducts =
            [];

        renderStoreProducts(
            []
        );

    }

}


/* ==========================================================
   PRODUCT TIMESTAMP
========================================================== */

function getProductTimestamp(product) {

    const value =
        product?.createdAt ||
        product?.timestamp ||
        product?.dateCreated;


    if (
        value?.toDate
    ) {

        return value
            .toDate()
            .getTime();

    }


    if (
        value instanceof Date
    ) {

        return value.getTime();

    }


    const parsed =
        new Date(
            value || 0
        )
        .getTime();


    return Number.isNaN(
        parsed
    )
        ? 0
        : parsed;

}


/* ==========================================================
   PRODUCT NAME
========================================================== */

function getProductName(product) {

    return String(
        product?.productName ||
        product?.name ||
        product?.title ||
        "Product"
    );

}


/* ==========================================================
   PRODUCT CATEGORY
========================================================== */

function getProductCategory(product) {

    return String(
        product?.productCategory ||
        product?.category ||
        product?.categoryName ||
        ""
    );

}


/* ==========================================================
   PRODUCT IMAGE
========================================================== */

function getProductImage(product) {

    if (
        product?.productImage
    ) {

        return product.productImage;

    }


    if (
        product?.image
    ) {

        return product.image;

    }


    if (
        product?.imageUrl
    ) {

        return product.imageUrl;

    }


    if (
        Array.isArray(
            product?.images
        ) &&
        product.images.length
    ) {

        const first =
            product.images[0];


        if (
            typeof first ===
            "string"
        ) {

            return first;

        }


        return (
            first?.url ||
            first?.image ||
            ""
        );

    }


    return "";

}


/* ==========================================================
   PRODUCT PRICE
========================================================== */

function getProductPrice(product) {

    return (
        product?.buyerPrice ||
        product?.buyerPriceDisplay ||
        product?.productPrice ||
        product?.price ||
        product?.sellerPrice ||
        0
    );

}


/* ==========================================================
   MONEY
========================================================== */

function formatMoney(value) {

    const number =
        Number(
            String(value)
                .replace(
                    /[^0-9.-]/g,
                    ""
                )
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return "$0.00";

    }


    return (
        "$" +
        number.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )
    );

}


/* ==========================================================
   PART 4 — PRODUCT CARDS / PRODUCT RATINGS
========================================================== */


/* ==========================================================
   GET PRODUCT RATING
========================================================== */

function getProductRating(product) {

    const value =
        product?.averageRating ??
        product?.rating ??
        product?.productRating ??
        0;


    const rating =
        Number(
            value
        );


    return Number.isFinite(
        rating
    )
        ? Math.max(
            0,
            Math.min(
                5,
                rating
            )
        )
        : 0;

}


/* ==========================================================
   GET PRODUCT REVIEW COUNT
========================================================== */

function getProductReviewCount(product) {

    const value =
        product?.reviewCount ??
        product?.reviewsCount ??
        product?.productReviewCount ??
        0;


    const count =
        Number(
            value
        );


    return Number.isFinite(
        count
    )
        ? count
        : 0;

}


/* ==========================================================
   CREATE STARS
========================================================== */

function createStars(rating) {

    const rounded =
        Math.round(
            Number(
                rating
            ) || 0
        );


    let html = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        html +=
            i <= rounded
                ? "★"
                : "☆";

    }


    return html;

}


/* ==========================================================
   LOAD PRODUCT RATINGS
========================================================== */

async function loadProductRatings() {

    if (!storeProducts.length) {

        return;

    }


    await Promise.all(

        storeProducts.map(
            async product => {

                try {

                    const reviews =
                        await loadProductReviews(
                            product.id
                        );


                    productReviewsCache[
                        product.id
                    ] =
                        reviews;


                    if (
                        reviews.length
                    ) {

                        const total =
                            reviews.reduce(
                                (
                                    sum,
                                    review
                                ) =>
                                    sum +
                                    getReviewRating(
                                        review
                                    ),
                                0
                            );


                        const average =
                            total /
                            reviews.length;


                        product.averageRating =
                            average;

                        product.reviewCount =
                            reviews.length;

                    }

                } catch (error) {

                    console.warn(
                        "PRODUCT RATING ERROR:",
                        product.id,
                        error
                    );

                }

            }
        )

    );


    renderStoreProducts(
        storeProducts
    );

}


/* ==========================================================
   LOAD PRODUCT REVIEWS
========================================================== */

async function loadProductReviews(
    productId
) {

    const possibleCollections = [

        "productReviews",

        "reviews"

    ];


    for (
        const collectionName
        of possibleCollections
    ) {

        try {

            const reviewQuery =
                query(
                    collection(
                        db,
                        collectionName
                    ),
                    where(
                        "productId",
                        "==",
                        productId
                    )
                );


            const snapshot =
                await getDocs(
                    reviewQuery
                );


            if (
                !snapshot.empty
            ) {

                return snapshot.docs.map(
                    item => ({
                        id:
                            item.id,
                        ...item.data()
                    })
                );

            }

        } catch (error) {

            console.warn(
                `Unable to read ${collectionName}:`,
                error
            );

        }

    }


    return [];

}


/* ==========================================================
   RENDER PRODUCTS
========================================================== */

function renderStoreProducts(
    products
) {

    if (!storeProductsContainer) {

        return;

    }


    storeProductsContainer.innerHTML =
        "";


    if (productResultCount) {

        productResultCount.textContent =
            `${products.length} products`;

    }


    if (!products.length) {

        if (productsEmpty) {

            productsEmpty.hidden =
                false;

        }

        return;

    }


    if (productsEmpty) {

        productsEmpty.hidden =
            true;

    }


    products.forEach(
        product => {

            storeProductsContainer.appendChild(
                createProductCard(
                    product
                )
            );

        }
    );

}


/* ==========================================================
   CREATE PRODUCT CARD
========================================================== */

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "store-product-card";


    const image =
        getProductImage(
            product
        );


    const name =
        getProductName(
            product
        );


    const category =
        getProductCategory(
            product
        );


    const price =
        getProductPrice(
            product
        );


    const rating =
        getProductRating(
            product
        );


    const reviewCount =
        getProductReviewCount(
            product
        );


    card.innerHTML = `

        <a
            class="store-product-link"
            href="product.html?id=${encodeURIComponent(product.id)}"
        >

            <div class="store-product-image">

                ${
                    image
                        ? `
                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(name)}"
                                loading="lazy"
                            >
                          `
                        : `
                            <div class="product-image-placeholder">
                                No Image
                            </div>
                          `
                }

            </div>


            <div class="store-product-content">

                ${
                    category
                        ? `
                            <span class="product-category">
                                ${escapeHTML(category)}
                            </span>
                          `
                        : ""
                }


                <h3>
                    ${escapeHTML(name)}
                </h3>


                <strong class="product-price">
                    ${formatMoney(price)}
                </strong>


                <div class="product-rating">

                    <span>
                        ${createStars(rating)}
                    </span>

                    <span>
                        ${rating.toFixed(1)}
                    </span>

                    <small>
                        (${reviewCount})
                    </small>

                </div>

            </div>

        </a>

    `;


    return card;

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHTML(value) {

    return String(
        value || ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* ==========================================================
   UPDATE PRODUCT RATING DOCUMENT
========================================================== */

async function updateProductRatingDocument(
    productId,
    average,
    count
) {

    try {

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        await updateDoc(
            productRef,
            {

                averageRating:
                    average,

                rating:
                    average,

                productRating:
                    average,

                reviewCount:
                    count,

                reviewsCount:
                    count,

                ratingUpdatedAt:
                    serverTimestamp()

            }
        );


    } catch (error) {

        /*
         Product pages may have rules that prevent
         another user from updating the product document.

         The calculated rating still works on this store page.
        */

        console.warn(
            "PRODUCT RATING DOCUMENT NOT UPDATED:",
            productId,
            error
        );

    }

}


/* ==========================================================
   REVIEW RATING VALUE
========================================================== */

function getReviewRating(review) {

    const value =
        review?.rating ??
        review?.stars ??
        review?.reviewRating ??
        0;


    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? Math.max(
            0,
            Math.min(
                5,
                number
            )
        )
        : 0;

}
/* ==========================================================
   PART 5 — STORE REVIEWS / RATING / SEARCH / TABS
========================================================== */


/* ==========================================================
   LOAD STORE REVIEWS
========================================================== */

async function loadStoreReviews() {

    try {

        const reviewQuery =
            query(
                collection(
                    db,
                    "storeReviews"
                ),
                where(
                    "sellerId",
                    "==",
                    sellerId
                )
            );


        const snapshot =
            await getDocs(
                reviewQuery
            );


        storeReviews =
            snapshot.docs
                .map(
                    item => ({
                        id:
                            item.id,
                        ...item.data()
                    })
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        getReviewTimestamp(b) -
                        getReviewTimestamp(a)
                );


        renderStoreReviews(
            storeReviews
        );


        updateStoreRatingDisplay();


    } catch (error) {

        console.error(
            "LOAD STORE REVIEWS ERROR:",
            error
        );


        storeReviews =
            [];


        renderStoreReviews(
            []
        );

    }

}


/* ==========================================================
   REVIEW DATE
========================================================== */

function getReviewTimestamp(
    review
) {

    const value =
        review?.createdAt ||
        review?.timestamp ||
        review?.date;


    if (
        value?.toDate
    ) {

        return value
            .toDate()
            .getTime();

    }


    if (
        value instanceof Date
    ) {

        return value.getTime();

    }


    const parsed =
        new Date(
            value || 0
        )
        .getTime();


    return Number.isNaN(
        parsed
    )
        ? 0
        : parsed;

}


/* ==========================================================
   FORMAT REVIEW DATE
========================================================== */

function formatReviewDate(
    review
) {

    const timestamp =
        getReviewTimestamp(
            review
        );


    if (!timestamp) {

        return "Date unavailable";

    }


    return new Date(
        timestamp
    ).toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* ==========================================================
   RENDER STORE REVIEWS
========================================================== */

function renderStoreReviews(
    reviews
) {

    if (!storeReviewsContainer) {

        return;

    }


    storeReviewsContainer.innerHTML =
        "";


    if (!reviews.length) {

        if (reviewsEmpty) {

            reviewsEmpty.hidden =
                false;

        }

        return;

    }


    if (reviewsEmpty) {

        reviewsEmpty.hidden =
            true;

    }


    reviews.forEach(
        review => {

            storeReviewsContainer.appendChild(
                createStoreReviewCard(
                    review
                )
            );

        }
    );

}


/* ==========================================================
   CREATE REVIEW CARD
========================================================== */

function createStoreReviewCard(
    review
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "store-review-card";


    const rating =
        getReviewRating(
            review
        );


    const reviewer =
        review?.reviewerName ||
        review?.userName ||
        review?.name ||
        "Buyer";


    const comment =
        review?.comment ||
        review?.review ||
        review?.text ||
        "";


    article.innerHTML = `

        <div class="review-header">

            <strong>
                ${escapeHTML(reviewer)}
            </strong>

            <time>
                ${escapeHTML(
                    formatReviewDate(
                        review
                    )
                )}
            </time>

        </div>


        <div class="review-stars">
            ${createStars(rating)}
            <span>
                ${rating.toFixed(1)}
            </span>
        </div>


        <p>
            ${escapeHTML(comment)}
        </p>

    `;


    return article;

}


/* ==========================================================
   CALCULATE STORE RATING
========================================================== */

function calculateStoreRating() {

    if (!storeReviews.length) {

        return {

            average: 0,

            count: 0

        };

    }


    const total =
        storeReviews.reduce(
            (
                sum,
                review
            ) =>
                sum +
                getReviewRating(
                    review
                ),
            0
        );


    return {

        average:
            total /
            storeReviews.length,

        count:
            storeReviews.length

    };

}


/* ==========================================================
   UPDATE STORE RATING DISPLAY
========================================================== */

function updateStoreRatingDisplay() {

    const result =
        calculateStoreRating();


    if (sellerRating) {

        sellerRating.textContent =
            `★ ${result.average.toFixed(1)}`;

    }


    if (reviewsAverageRating) {

        reviewsAverageRating.textContent =
            result.average.toFixed(1);

    }


    if (reviewsTotalCount) {

        reviewsTotalCount.textContent =
            result.count;

    }

}


/* ==========================================================
   LOAD SELLER RATING
========================================================== */

async function loadSellerRating() {

    try {

        updateStoreRatingDisplay();


        if (
            !isStoreOwner()
        ) {

            return;

        }


        if (
            !sellerCollection
        ) {

            return;

        }


        const result =
            calculateStoreRating();


        const sellerRef =
            doc(
                db,
                sellerCollection,
                sellerId
            );


        await updateDoc(
            sellerRef,
            {

                averageRating:
                    result.average,

                rating:
                    result.average,

                reviewCount:
                    result.count,

                reviewsCount:
                    result.count,

                ratingUpdatedAt:
                    serverTimestamp()

            }
        );


    } catch (error) {

        console.warn(
            "LOAD SELLER RATING ERROR:",
            error
        );

    }

}


/* ==========================================================
   REVIEW STAR INPUT
========================================================== */

function setupStoreReviewRating() {

    if (!storeReviewRatingInput) {

        return;

    }


    const buttons =
        storeReviewRatingInput
            .querySelectorAll(
                "[data-rating]"
            );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectedStoreRating =
                        Number(
                            button.dataset.rating
                        );


                    highlightReviewStars();

                }
            );

        }
    );


    highlightReviewStars();

}


/* ==========================================================
   HIGHLIGHT REVIEW STARS
========================================================== */

function highlightReviewStars() {

    if (!storeReviewRatingInput) {

        return;

    }


    const buttons =
        storeReviewRatingInput
            .querySelectorAll(
                "[data-rating]"
            );


    buttons.forEach(
        button => {

            const value =
                Number(
                    button.dataset.rating
                );


            button.classList.toggle(
                "selected",
                value <=
                selectedStoreRating
            );

        }
    );

}


/* ==========================================================
   STORE REVIEW FORM
========================================================== */

function setupStoreReviewForm() {

    if (!storeReviewForm) {

        return;

    }


    storeReviewForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please log in before writing a review."
                );

                return;

            }


            if (
                !currentUser.emailVerified
            ) {

                alert(
                    "Please verify your email before writing a review."
                );

                return;

            }


            if (
                isStoreOwner()
            ) {

                alert(
                    "You cannot review your own store."
                );

                return;

            }


            if (
                selectedStoreRating <
                1 ||
                selectedStoreRating >
                5
            ) {

                alert(
                    "Please select a rating from 1 to 5 stars."
                );

                return;

            }


            const comment =
                storeReviewComment
                    ?.value
                    ?.trim();


            if (!comment) {

                alert(
                    "Please write your review."
                );

                return;

            }


            const alreadyReviewed =
                storeReviews.some(
                    review =>
                        review.userId ===
                        currentUser.uid
                );


            if (alreadyReviewed) {

                alert(
                    "You have already reviewed this store."
                );

                return;

            }


            try {

                const submitButton =
                    storeReviewForm
                        .querySelector(
                            "button[type='submit']"
                        );


                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.textContent =
                        "Submitting...";

                }


                await addDoc(
                    collection(
                        db,
                        "storeReviews"
                    ),
                    {

                        sellerId:
                            sellerId,

                        userId:
                            currentUser.uid,

                        reviewerName:
                            currentUser.displayName ||
                            currentUser.email ||
                            "Buyer",

                        rating:
                            selectedStoreRating,

                        comment:
                            comment,

                        createdAt:
                            serverTimestamp()

                    }
                );


                selectedStoreRating =
                    0;


                storeReviewComment.value =
                    "";


                highlightReviewStars();


                await loadStoreReviews();

                await loadSellerRating();


                alert(
                    "Your store review was submitted successfully."
                );


            } catch (error) {

                console.error(
                    "STORE REVIEW ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to submit your review."
                );


            } finally {

                const submitButton =
                    storeReviewForm
                        .querySelector(
                            "button[type='submit']"
                        );


                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Review";

                }

            }

        }
    );

}


/* ==========================================================
   STORE TABS
========================================================== */

function setupStoreTabs() {

    const tabs =
        document.querySelectorAll(
            ".store-tab"
        );


    const productsSection =
        document.getElementById(
            "productsSection"
        );

    const reviewsSection =
        document.getElementById(
            "reviewsSection"
        );


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    const section =
                        tab.dataset.section;


                    tabs.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


                    if (
                        section ===
                        "products"
                    ) {

                        productsSection.hidden =
                            false;

                        reviewsSection.hidden =
                            true;

                    }


                    if (
                        section ===
                        "reviews"
                    ) {

                        productsSection.hidden =
                            true;

                        reviewsSection.hidden =
                            false;

                        loadStoreReviews();

                    }

                }
            );

        }
    );

}


/* ==========================================================
   STORE SEARCH
========================================================== */

function setupStoreSearch() {

    if (!storeSearchForm) {

        return;

    }


    storeSearchForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            filterStoreProducts();

        }
    );


    storeSearch?.addEventListener(
        "input",
        filterStoreProducts
    );

}


/* ==========================================================
   FILTER PRODUCTS
========================================================== */

function filterStoreProducts() {

    const text =
        (
            storeSearch?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    if (!text) {

        renderStoreProducts(
            storeProducts
        );

        if (productsSubtitle) {

            productsSubtitle.textContent =
                "Products available in this store";

        }

        return;

    }


    const filtered =
        storeProducts.filter(
            product => {

                const name =
                    getProductName(
                        product
                    ).toLowerCase();


                const category =
                    getProductCategory(
                        product
                    ).toLowerCase();


                const description =
                    String(
                        product?.description ||
                        product?.productDescription ||
                        ""
                    )
                    .toLowerCase();


                return (
                    name.includes(text) ||
                    category.includes(text) ||
                    description.includes(text)
                );

            }
        );


    renderStoreProducts(
        filtered
    );


    if (productsSubtitle) {

        productsSubtitle.textContent =
            `Search results for "${text}"`;

    }

}


/* ==========================================================
   OWNER CONTACT EDITOR
========================================================== */

function setupOwnerContactEditor() {

    if (!isStoreOwner()) {

        const oldButton =
            document.getElementById(
                "ownerContactEditor"
            );


        if (oldButton) {

            oldButton.hidden =
                true;

        }

        return;

    }


    let button =
        document.getElementById(
            "ownerContactEditor"
        );


    if (!button) {

        button =
            document.createElement(
                "button"
            );


        button.type =
            "button";

        button.id =
            "ownerContactEditor";

        button.className =
            "secondary-action";

        button.textContent =
            "Add / Update WhatsApp & Call Numbers";


        const actions =
            document.querySelector(
                ".seller-actions"
            );


        if (actions) {

            actions.appendChild(
                button
            );

        }

    }


    button.hidden =
        false;


    button.onclick =
        async () => {

            const existing =
                getSellerContacts();


            const whatsapp =
                prompt(
                    "Enter WhatsApp number:",
                    existing.whatsapp || ""
                );


            if (
                whatsapp ===
                null
            ) {

                return;

            }


            const phone1 =
                prompt(
                    "Enter Call Number 1:",
                    existing.phone1 || ""
                );


            if (
                phone1 ===
                null
            ) {

                return;

            }


      const phone2 =
                prompt(
                    "Enter Call Number 2 (optional):",
                    existing.phone2 || ""
                );


            if (
                phone2 ===
                null
            ) {

                return;

            }


            if (
                !whatsapp.trim()
            ) {

                alert(
                    "WhatsApp number is required."
                );

                return;

            }


            if (
                !phone1.trim()
            ) {

                alert(
                    "Call Number 1 is required."
                );

                return;

            }


            try {

                button.disabled =
                    true;

                button.textContent =
                    "Saving...";


                await saveSellerData({

                    whatsapp:
                        whatsapp.trim(),

                    whatsappNumber:
                        whatsapp.trim(),

                    phone1:
                        phone1.trim(),

                    phoneNumber1:
                        phone1.trim(),

                    phone2:
                        phone2.trim(),

                    phoneNumber2:
                        phone2.trim()

                });


                setupContactButtons();


                alert(
                    "WhatsApp and call numbers saved successfully."
                );


            } catch (error) {

                console.error(
                    "CONTACT SAVE ERROR:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to save contact numbers."
                );

            } finally {

                button.disabled =
                    false;

                button.textContent =
                    "Add / Update WhatsApp & Call Numbers";

            }

        };

}


/* ==========================================================
   SHARE BUTTON
========================================================== */

function setupShareStoreButton() {

    if (!contactSellerButton) {

        return;

    }


    contactSellerButton.onclick =
        event => {

            event.preventDefault();

            shareSellerStore();

        };

}


/* ==========================================================
   FINAL HTML GLOBAL FUNCTIONS
========================================================== */

window.callSeller =
    callSeller;

window.openSellerWhatsApp =
    openSellerWhatsApp;

window.shareSellerStore =
    shareSellerStore;
    
    