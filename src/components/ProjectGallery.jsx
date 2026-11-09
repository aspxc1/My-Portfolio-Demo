import { useState } from "react"
import "./ProjectGallery.css"

/** Optional media disappears entirely when omitted, empty, or unavailable. */
export default function ProjectGallery({ images = [], name }) {
  const [failed, setFailed] = useState([])
  const visible = (Array.isArray(images) ? images : []).filter(
    (image) => typeof image?.src === "string" && image.src.trim() && !failed.includes(image.src),
  )
  if (visible.length === 0) return null

  return (
    <section aria-labelledby="screenshots" className="project-gallery">
      <h2 id="screenshots" className="label">Screenshots</h2>
      {visible.map((image, index) => (
        <figure key={image.src}>
          <img
            src={image.src}
            alt={image.alt || `${name}, screenshot ${index + 1}`}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            onError={() => setFailed((previous) => [...previous, image.src])}
          />
          {image.caption ? <figcaption>{image.caption}</figcaption> : null}
        </figure>
      ))}
    </section>
  )
}
