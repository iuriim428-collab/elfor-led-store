export const darkBackgroundImageUrls = new Set([
  "/api/storage/objects/uploads/af01cd6f-2104-41d3-982c-d50a64010ce0",
  "/api/storage/objects/uploads/7cc1eee9-f305-4c2b-bc5b-820c80d0488f",
  "/api/storage/objects/uploads/b5eaeaa4-3fca-40ba-82a6-4cb17e3c07fb",
  "/api/storage/objects/uploads/7ec835eb-7389-41ef-b880-c66e0121f33d",
  "/api/storage/objects/uploads/03fbe018-37bc-4e6a-9446-b1c0bf3dfaf8",
  "/api/storage/objects/uploads/aefb46d7-8cb0-4c0f-aefb-dfbfe58d8298",
  "/api/storage/objects/uploads/3931bc11-113c-421d-89da-954319d13e09",
  "/api/storage/objects/uploads/9f90d649-4890-4b35-acda-2f6d2bb1e415",
  "/api/storage/objects/uploads/a62d0e88-24ed-46d4-9854-b0af8fb71bb3",
  "/api/storage/objects/uploads/2dc4279d-74db-4d15-8718-6a169fccc77b",
  "/api/storage/objects/uploads/66d67f30-86bd-44d5-957b-b055fe693c80",
  "/api/storage/objects/uploads/ab2aed78-f63e-4db8-b7d1-1c7c0939e06f",
  "/api/storage/objects/uploads/054e3fa5-cb5a-43b9-9c20-fe918b1c429f",
  "/api/storage/objects/uploads/70c95c69-0522-465d-b69a-e5863b5298a6",
  "/api/storage/objects/uploads/93e8b675-529f-430d-91a2-60165e27d2f9",
  "/api/storage/objects/uploads/eca164e4-4242-44da-bad2-a98dc680a11f",
  "/products/L4U15.png",
  "/api/storage/objects/uploads/8b70f949-1f10-4480-80fa-92560acf862d",
  "/api/storage/objects/uploads/d24d1dea-11f6-4abd-9594-efc2bf95a45e",
  "/api/storage/objects/uploads/5406661b-f300-4869-99e2-e6f1113906e2",
  "/api/storage/objects/uploads/5d79016f-146a-4df1-8e01-5bb852549fed",
  "/api/storage/objects/uploads/58498376-3d4f-4365-ad31-210f26bd6892",
  "/api/storage/objects/uploads/60aa0a20-a65e-4f9c-89db-7805860c575f",
  "/api/storage/objects/uploads/d63d71a0-e54f-44f3-b24b-b7d8b3399327",
  "/api/storage/objects/uploads/2712549e-9058-4dde-8a7e-991461450fe4",
]);

export function hasDarkBackgroundImage(url: string) {
  return darkBackgroundImageUrls.has(url);
}

export function sortProductImages(urls: string[]) {
  const unique = urls.filter((url, index) => urls.indexOf(url) === index);
  const lightImages = unique.filter((url) => !hasDarkBackgroundImage(url));
  const darkImages = unique.filter((url) => hasDarkBackgroundImage(url));

  return [...lightImages, ...darkImages];
}
