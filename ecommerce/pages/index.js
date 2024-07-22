import React from 'react'
import { Product, FooterBanner, HeroBanner } from '@/components'
import { client } from '@/lib/client'

const Home = ({productData, bannerData}) => {
  return (
    <>

      <HeroBanner heroBanner = {bannerData.length && bannerData[0]} />

      <div className='products-heading'>
        <h2>Best selling products</h2>
        <p>Speakers of many variations</p>
      </div>

      <div className='products-container'>
        {productData?.map((product)=> <Product key= {product._id} product = {product} />)}
      </div>

      <FooterBanner />
    </>
  )
}


export const getServerSideProps = async() =>{

  const productQuery = '*[_type == "product"]'
  const productData = await client.fetch(productQuery)

  const bannerQuery = '*[_type == "banner"]'
  const bannerData = await client.fetch(bannerQuery)

  return {
    props: {productData, bannerData}
  }

} 

export default Home
