
export const MediaEndpoint = {
    uploadImage: {
        url: "/upload/image",
        method: "POST"
    },
    getAllImage: {
        url: "/image/all/",
        method: "GET"
    },
    getImage: (imageId: string) => ({
        url: `/image/${imageId}`,
        method: "GET"
    }),
    deleteImage: (imageId: string) => ({
        url: `/image/delete/${imageId}`,
        method: "DELETE"
    }),
    detectImage: (imageId: string, model_name: string) => ({
        url: `/detect/${imageId}?model_name=${model_name}`,
        method: "POST"
    }),
    detectVideo: (model_name: string) => ({
        url: `/detect/video?model_name=${model_name}`,
        method: "POST"
    })
}