// import { localDatabase } from "src/infrastructure/database/DatabaseProviders";

// export class ExampleService {
//     async saveMultipleTable() {
//         await localDatabase.transaction(async (transaction) => {
//             await BarangModel.create(barang, { transaction });
//             await VarianModel.bulkCreate(variants, { transaction });
//             await VarianTokoModel.bulkCreate(variantTokos, { transaction });
//             await ImgBarangModel.bulkCreate(gambar, { transaction });
//             await BarangLabelModel.bulkCreate(await barangLabel, {
//                 transaction,
//             });
//         });
//     }
// }
