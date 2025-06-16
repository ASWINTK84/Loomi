import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FaShippingFast, FaRedo, FaShieldAlt, FaComments } from 'react-icons/fa';
import { useProducts } from '../../context/ProductContext';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { offerProducts, loading, error } = useProducts();

  const mainHeroCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
    fade: true,
    cssEase: "ease-in-out"
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100">
        <p className="text-gray-600 text-lg">Loading amazing offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96 bg-red-100 text-red-700 p-4 rounded">
        <p>Error displaying offers: {error.message || "An unknown error occurred"}</p>
      </div>
    );
  }

 
  // Add a check to ensure it's an array before using
  const offers = Array.isArray(offerProducts) ? offerProducts : [];

  if (offers.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100">
        <p className="text-gray-600 text-lg">No current special offers available.</p>
      </div>
    );
  }

  const calculateOfferPrice = (price, offerPercentage) => {
    return price - (price * offerPercentage) / 100;
  };

  return (
    <>
      <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-12 md:py-20 lg:py-24 ">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">

            {/* Main Carousel */}
            <div className="w-full lg:w-2/3 bg-white rounded-lg shadow-xl p-6 md:p-10 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 rounded-lg"></div>

              <Slider {...mainHeroCarouselSettings}>
                {offers.map((offer) => {
                  // Ensure 'product' exists within the offer object
                  const product = offer.product;
                  if (!product) {
                    console.warn("Offer object missing 'product' property:", offer);
                    return null; // Skip rendering if product data is missing
                  }

                  const currentPrice = calculateOfferPrice(product.price, offer.offerPercentage);
                  return (
                    <div key={offer._id}>
                      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="relative z-10 text-center md:text-left flex-1">
                          {offer.offerPercentage > 0 && (
                            <span className="text-blue-600 text-3xl md:text-4xl lg:text-5xl font-extrabold block mb-2">
                              {offer.offerPercentage}% <span className="text-gray-700 text-xl font-normal">Sale Off</span>
                            </span>
                          )}
                          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                            {product.name}
                          </h2>
                          <p className="text-gray-600 text-sm md:text-base mb-6 max-w-md mx-auto md:mx-0">
                            {product.description}
                          </p>
                        <Link to={`/product/${product._id}`} ><a href="" className="inline-block bg-gray-800 text-white text-base md:text-lg font-medium px-6 py-3 rounded-md hover:bg-gray-700 transition-colors duration-300">
                            Shop Now
                          </a></Link>  
                        </div>
                        <div className="relative z-10 w-full md:w-1/2 lg:w-2/5 flex justify-center items-center p-4">
                          <img
                            src={product.imageUrl || (product.images?.[0]?.url) || "/images/default.png"}
                            alt={product.name}
                            className="max-w-full h-auto object-contain drop-shadow-2xl"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Slider>
            </div>

            {/* Sidebar Featured Cards */}
            <div className="w-full lg:w-1/3 flex flex-col gap-8 justify-between">
              {(offers
                .filter(offer => offer.product) 
                .sort(() => 0.5 - Math.random())
                .slice(0, 2)
              ).map((offer) => {
                const product = offer.product;
                const currentPrice = calculateOfferPrice(product.price, offer.offerPercentage);
                return (
                  <div
                    key={offer._id}
                    className="bg-white rounded-2xl shadow-2xl p-8 flex items-center justify-between hover:shadow-3xl transition-shadow duration-300 min-h-[180px]"
                  >
                    <div className="flex-1 pr-6">
                      <h3 className="text-gray-900 font-bold text-2xl mb-2">{product.name}</h3>
                      {offer.limitedTimeOffer && (
                        <p className="text-base text-red-500 mb-2 font-medium">Limited time offer</p>
                      )}
                      <div className="flex items-baseline space-x-3">
                        <span className="text-indigo-700 font-extrabold text-2xl">${currentPrice.toFixed(2)}</span>
                        {product.price > currentPrice && (
                          <span className="text-gray-400 line-through text-lg">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <div className="w-24 h-24 flex-shrink-0">
                      <img
                        src={product.imageUrl || (product.images?.[0]?.url) || "/images/default.png"}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                );
              })}
            </div>


          </div>
        </div>
      </section>

      {/* Featured Services */}
      <div className="bg-gray-100 py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: FaShippingFast, title: "Free Shipping", desc: "For all orders over $200" },
              { icon: FaRedo, title: "Easy Returns", desc: "15-day money-back guarantee" },
              { icon: FaShieldAlt, title: "Secure Payments", desc: "Protected by trusted security" },
              { icon: FaComments, title: "24/7 Support", desc: "Dedicated customer assistance" },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center text-center hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="bg-black text-white p-3 rounded-full mb-3">
                  <service.icon className="text-2xl" />
                </div>
                <h3 className="font-semibold text-lg text-black mb-1">{service.title}</h3>
                <p className="text-gray-700 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </>
  );
};

export default Hero;