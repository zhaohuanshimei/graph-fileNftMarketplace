import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  FileNftMarketplace,
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
  ItemSoldOut as ItemSoldOutEvent,
} from "../generated/FileNftMarketplace/FileNftMarketplace";
import {
  ActiveItem,
  ItemOwnership,
  ItemBought,
  ItemCanceled,
  ItemListed,
  ItemSoldOut,
} from "../generated/schema";

export function handleItemBought(event: ItemBoughtEvent): void {
  let itemBought = ItemBought.load(
    getIdFromEventParams(event.params.tokenId, event.params.seller)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.seller)
  );
  let itemOwnership = ItemOwnership.load(
    getIdFromEventParams(event.params.tokenId, event.params.buyer)
  );

  if (!itemBought) {
    itemBought = new ItemBought(
      getIdFromEventParams(event.params.tokenId, event.params.seller)
    );
  }

  itemBought.buyer = event.params.buyer;
  itemBought.seller = event.params.seller;
  itemBought.tokenId = event.params.tokenId;
  itemBought.amountRemain = event.params.amountRemain;
  itemBought.price = event.params.price; //if we don't need this item, we will delete it later

  activeItem!.amountListed = event.params.amountRemain;
  activeItem!.amountSold = activeItem!.amountSold.plus(BigInt.fromString("1"));

  itemOwnership = new ItemOwnership(
    getIdFromEventParams(event.params.tokenId, event.params.buyer)
  );
  itemOwnership.amount = BigInt.fromString("1");
  itemOwnership.owner = event.params.buyer;
  itemOwnership.tokenId = event.params.tokenId;
  itemOwnership.price = event.params.price; //if we don't need this item, we will delete it later

  itemBought.save();
  activeItem!.save();
  itemOwnership.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let itemCanceled = ItemCanceled.load(
    getIdFromEventParams(event.params.tokenId, event.params.seller)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.seller)
  );
  if (!itemCanceled) {
    itemCanceled = new ItemCanceled(
      getIdFromEventParams(event.params.tokenId, event.params.seller)
    );
  }
  itemCanceled.seller = event.params.seller;
  itemCanceled.tokenId = event.params.tokenId;
  activeItem!.amountListed = BigInt.fromString("0");

  itemCanceled.save();
  activeItem!.save();
}

export function handleItemListed(event: ItemListedEvent): void {
  let itemListed = ItemListed.load(
    getIdFromEventParams(event.params.tokenId, event.params.seller)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.seller)
  );

  let itemOwnership = ItemOwnership.load(
    getIdFromEventParams(event.params.tokenId, event.params.seller)
  );

  if (!itemListed) {
    itemListed = new ItemListed(
      getIdFromEventParams(event.params.tokenId, event.params.seller)
    );
  }
  if (!activeItem) {
    activeItem = new ActiveItem(
      getIdFromEventParams(event.params.tokenId, event.params.seller)
    );
    activeItem.amountSold = BigInt.fromString("0");
  }
  if (!itemOwnership) {
    itemOwnership = new ItemOwnership(
      getIdFromEventParams(event.params.tokenId, event.params.seller)
    );
  }

  itemListed.seller = event.params.seller;
  activeItem.seller = event.params.seller;
  itemOwnership.owner = event.params.seller;

  itemListed.tokenId = event.params.tokenId;
  activeItem.tokenId = event.params.tokenId;
  itemOwnership.tokenId = event.params.tokenId;

  itemListed.price = event.params.price;
  activeItem.price = event.params.price;
  itemOwnership.price = event.params.price; //if we don't need this item, we will delete it later

  itemListed.amount = event.params.amount;
  activeItem.amountListed = event.params.amount;
  itemOwnership.amount = event.params.amount; //Just collect the listed amount

  itemListed.save();
  activeItem.save();
  itemOwnership.save();
}

//Maybe we don't need this emit!
export function handleItemSoldOut(event: ItemSoldOutEvent): void {
  // let itemSoldOut = ItemSoldOut.load(
  //   getIdFromEventParams(event.params.tokenId, event.params.seller)
  // );
  // let activeItem = ActiveItem.load(
  //   getIdFromEventParams(event.params.tokenId, event.params.seller)
  // );
  // if (!itemSoldOut) {
  //   itemSoldOut = new ItemSoldOut(
  //     getIdFromEventParams(event.params.tokenId, event.params.seller)
  //   );
  // }
  // itemSoldOut.seller = event.params.seller;
  // itemSoldOut.tokenId = event.params.tokenId;
  // activeItem!.amountListed = BigInt.fromString("0");
}

function getIdFromEventParams(tokenId: BigInt, seller: Address): string {
  return tokenId.toHexString() + seller.toHexString();
}
