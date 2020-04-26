import { DairyTemplatePage } from './app.po';

describe('Dairy App', function() {
  let page: DairyTemplatePage;

  beforeEach(() => {
    page = new DairyTemplatePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
