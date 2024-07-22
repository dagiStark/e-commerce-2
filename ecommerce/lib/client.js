import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const client = createClient({
    projectId: '8hlyq26i',
    dataset: 'production',
    apiVersion: '',
    useCdn: true,
    token: ''
})

export default client