import puppeteer from 'puppeteer';
import fs from 'fs/promises';

async function GetPricesFromWebPage() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/usr/bin/google-chrome-stable',
  });

  const page = await browser.newPage();

  await page.goto(
    'https://www.superselectos.com/Tienda/Catalogo/carnes?categoria=272',
  );

  const result = await page.evaluate(() => {
    const elementosProd = document.querySelectorAll('.elementoProd');

    const elementosProdData = [...elementosProd].map((elementoProd) => {
      const productFrame = elementoProd.querySelectorAll('.productFrame');

      const productFrameData = [...productFrame].map((product) => {
        const descriptionData = [
          ...product.querySelectorAll('.descripcion'),
        ].map((descrip) => {
          const description = descrip.querySelector('.desc').innerText;

          const priceData = [...descrip.querySelectorAll('.numeros')].map(
            (priceNum) => {
              const numPrice = [...priceNum.querySelectorAll('.precio')].map(
                (price) => {
                  const priceInfo =
                    priceNum.getElementsByTagName('span')[0].innerHTML;

                  return priceInfo;
                },
              );

              return numPrice;
            },
          );

          const flatPrice = priceData.flat(2)[0];

          return {
            description,
            price: flatPrice,
          };
        });

        return descriptionData;
      });

      return productFrameData;
    });

    return elementosProdData;
  });

  await fs.writeFile(
    'meat-category.json',
    JSON.stringify(result.flat(2), null, 2),
  );

  await browser.close();
}

GetPricesFromWebPage();
