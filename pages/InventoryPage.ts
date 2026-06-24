import { type Page, type Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  // testid preferred: <span> has no ARIA heading role so role locator does not apply
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.inventoryList = page.locator('[data-test="inventory-list"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
  }

  async waitForLoad(): Promise<void> {
    // Web-first assertion — automatically retries until text is present or timeout
    await this.title.filter({ hasText: 'Products' }).waitFor();
  }
}
