import { _Image } from "../../interfaces"

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
    })
}