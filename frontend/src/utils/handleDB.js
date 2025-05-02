const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("imageGallery", 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains("images")) {
                db.createObjectStore("images", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = (err) => reject(err);
    });
};

const storeImage = async (image) => {
    const db = await openDB();
    const transaction = db.transaction("images", "readwrite");
    const store = transaction.objectStore("images");
    store.add(image);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = (err) => reject(err);
    });
};

const fetchImages = async () => {
    const db = await openDB();
    const transaction = db.transaction("images", "readonly");
    const store = transaction.objectStore("images");
    const images = store.getAll();
    return new Promise((resolve, reject) => {
        images.onsuccess = () => resolve(images.result);
        images.onerror = (err) => reject(err);
    });
};
