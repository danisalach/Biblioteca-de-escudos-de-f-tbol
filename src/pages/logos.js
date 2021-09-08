import React, { useState, useEffect, useRef } from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import { LocalizedLink } from 'gatsby-plugin-usei18n'
import { useIntl } from 'react-intl'

import Layout from '../components/layout'
import Seo from '../components/seo'
import Search from '../components/singleSearch'

import {
  mainContent,
  logosWrapper,
  adsenseContainer,
  logosContainer,
  cardLink,
  logoImage,
  cardFooter,
  logoName,
  formatList,
  formatItem,
  loadRefContainer,
  nothingContainer,
  nothingText
} from './logos.module.styl'

const AllLogo = ({ data, pageContext }) => {
  const intl = useIntl()
  // Array of all news logos
  const allLogos = data.allLogo.nodes

  // State for the list
  const [list, setList] = useState([...allLogos.slice(0, 20)])

  // State to trigger oad more
  const [loadMore, setLoadMore] = useState(false)

  // State of whether there is more to load
  const [hasMore, setHasMore] = useState(allLogos.length > 20)

  //Set a ref for the loading div
  const loadRef = useRef()

  // Handle intersection with load more div
  const handleObserver = entities => {
    const target = entities[0]
    if (target.isIntersecting) {
      setLoadMore(true)
    }
  }

  //Initialize the intersection observer API
  useEffect(() => {
    var options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    }
    const observer = new IntersectionObserver(handleObserver, options)
    if (loadRef.current) {
      observer.observe(loadRef.current)
    }
  }, [])

  // Handle loading more articles
  useEffect(() => {
    if (loadMore && hasMore) {
      const currentLength = list.length
      const isMore = currentLength < allLogos.length
      const nextResults = isMore ? allLogos.slice(currentLength, currentLength + 20) : []
      setList([...list, ...nextResults])
      setLoadMore(false)
    }
  }, [loadMore, hasMore]) //eslint-disable-line

  //Check if there is more
  useEffect(() => {
    const isMore = list.length < allLogos.length
    setHasMore(isMore)
  }, [list]) //eslint-disable-line

  return (
    <Layout pageContext={pageContext}>
      <Seo title={intl.formatMessage({ id: 'home.title' })} />
      <Search />
      <div className={mainContent}>
        <section className={logosWrapper}>
          <div className={adsenseContainer}>
            <span>Google Adsense</span>
          </div>
          {allLogos.length ? (
            <>
              <div className={logosContainer}>
                {list.map(logo => (
                  <article key={logo.id}>
                    <LocalizedLink className={cardLink} to={logo.slug}>
                      <GatsbyImage
                        image={getImage(logo.pngPath)}
                        alt={logo.detailInfo[0].info[0].fullName[1]}
                        className={logoImage}
                      />
                      <footer className={cardFooter}>
                        <h3 className={logoName}>{logo.detailInfo[0].info[0].shortName[1]}</h3>
                        <ul className={formatList}>
                          {logo.fileFormat.map(item => (
                            <li key={item} className={formatItem}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </footer>
                    </LocalizedLink>
                  </article>
                ))}
              </div>
              <div ref={loadRef} className={loadRefContainer}>
                <span></span>
                {hasMore ? (
                  <span>{intl.formatMessage({ id: `index.loading` })}</span>
                ) : (
                  <span>{intl.formatMessage({ id: `index.noMore` })}</span>
                )}
                <span></span>
              </div>
            </>
          ) : (
            <div className={nothingContainer}>
              <h2 className={nothingText}>{intl.formatMessage({ id: `index.noLogo` })}</h2>
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}

export default AllLogo

export const query = graphql`
  query ($locale: String!) {
    allLogo(
      sort: { order: DESC, fields: pngPath___birthTime }
      filter: { fields: { locale: { eq: $locale } } }
    ) {
      nodes {
        id
        pngPath {
          childImageSharp {
            gatsbyImageData(width: 300, placeholder: BLURRED, formats: WEBP, layout: CONSTRAINED)
          }
        }
        fileFormat
        slug
        detailInfo {
          info {
            fullName
            shortName
          }
        }
      }
      totalCount
    }
  }
`
