import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'

async function main() {
  const svgPath = 'public/icon.svg'
  const outDir = 'public'

  let svg
  try {
    svg = readFileSync(svgPath, 'utf8')
  } catch (e) {
    console.error('Erro: não foi possível ler public/icon.svg')
    process.exit(1)
  }

  const sizes = [192, 512]

  try {
    const { createCanvas, Image } = await import('canvas')
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

    for (const size of sizes) {
      const canvas = createCanvas(size, size)
      const ctx = canvas.getContext('2d')

      const img = new Image()
      img.src = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64')

      await new Promise((resolve) => {
        img.onload = resolve
        img.onerror = resolve
      })

      ctx.drawImage(img, 0, 0, size, size)
      const buffer = canvas.toBuffer('image/png')
      writeFileSync(`${outDir}/icon-${size}.png`, buffer)
      console.log(`Gerado: public/icon-${size}.png`)
    }

    console.log('\nPNGs gerados com sucesso!')
  } catch (e) {
    console.warn('node-canvas não disponível:', e.message)
    console.warn('Gerando SVGs dimensionados em vez de PNG.')
    console.warn('Para converter em PNG, abra public/icon.svg no navegador e salve como imagem,')

    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

    for (const size of sizes) {
      const sizedSvg = svg.replace('<svg ', `<svg width="${size}" height="${size}" `)
      writeFileSync(`${outDir}/icon-${size}.svg`, sizedSvg)
      console.log(`Gerado: public/icon-${size}.svg`)
    }
  }
}

main()
