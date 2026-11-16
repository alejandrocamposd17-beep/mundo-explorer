import { expect, test } from "@playwright/test";

test.describe("Mundo Explorer", () => {
  test("la portada carga y lleva al listado de países", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("El mundo en la palma de tu mano");
    await page.getByRole("link", { name: "Explorar países" }).click();
    await expect(page).toHaveURL(/\/paises$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Países del mundo");
  });

  test("la búsqueda ignora tildes y mayúsculas", async ({ page }) => {
    await page.goto("/paises");
    await page.getByPlaceholder("País o capital…").fill("PERU");
    await expect(page.getByRole("heading", { name: "Perú", level: 3 })).toBeVisible();
    await expect(page.getByText("1 resultado")).toBeVisible();
  });

  test("el detalle de un país muestra sus datos", async ({ page }) => {
    await page.goto("/paises/slv");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("El Salvador");
    await expect(page.getByText("San Salvador").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /favoritos/ })).toBeVisible();
  });

  test("agregar a favoritos aparece en la página de favoritos", async ({ page }) => {
    await page.goto("/paises/jpn");
    await page.getByRole("button", { name: /Agregar a favoritos/ }).click();
    await expect(page.getByRole("button", { name: /En favoritos/ })).toBeVisible();
    await page.goto("/favoritos");
    await expect(page.getByRole("link", { name: "Japón" })).toBeVisible();
  });

  test("el comparador muestra ambos países", async ({ page }) => {
    await page.goto("/comparar?a=slv&b=gtm");
    const table = page.getByRole("table");
    await expect(table).toContainText("El Salvador");
    await expect(table).toContainText("Guatemala");
    await expect(page.getByText(/veces más grande/)).toBeVisible();
  });

  test("cambiar a inglés traduce la interfaz", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Switch to English" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("The world in the palm of your hand");
  });

  test("el juego de banderas da retroalimentación", async ({ page }) => {
    await page.goto("/juegos/banderas");
    const options = page.locator("section").getByRole("button");
    await expect(options).toHaveCount(4);
    await options.first().click();
    await expect(page.getByText(/Correcto|Incorrecto/)).toBeVisible();
  });

  test("el buscador rápido (Ctrl+K) abre países", async ({ page, isMobile }) => {
    test.skip(isMobile, "Atajo de teclado solo en escritorio");
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.getByPlaceholder("Busca un país o una capital…").fill("japon");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/paises\/jpn$/);
  });

  test("rankings muestra las cuatro listas", async ({ page }) => {
    await page.goto("/rankings");
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
  });

  test("la API de clima rechaza parámetros inválidos", async ({ request }) => {
    const res = await request.get("/api/clima?lat=999&lon=abc");
    expect(res.status()).toBe(400);
  });

  test("un país inexistente muestra la página 404", async ({ page }) => {
    await page.goto("/paises/zzz");
    await expect(page.getByText("Página no encontrada")).toBeVisible();
  });
});
