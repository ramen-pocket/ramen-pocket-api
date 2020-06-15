import { MariadbConnection } from '../../database/mariadb-connection';
import { MariadbQueryAgent } from '../../database/mariadb-query-agent';
import { StoreStore } from '../../repositories/store/store-store';
import { StoreService } from '../../services/store/store-service';
import { CollectiveStoreStore } from '../../repositories/collective-store/collective-store-store';
import { CollectiveStoreService } from '../../services/collective-store/collective-store-service';
import { GetStoresHandler } from '../../controllers/store/get-stores-handler';
import { Guarantee } from '../../controllers/utils/guarantee';
import { handleError } from '../../controllers/sentinel';

const connection = new MariadbConnection();
const queryAgent = new MariadbQueryAgent(connection);
const storeStore = new StoreStore(queryAgent);
const storeService = new StoreService(storeStore);
const collectiveStoreStore = new CollectiveStoreStore(queryAgent);
const collectiveStoreService = new CollectiveStoreService(collectiveStoreStore);
const getStoresHandler = new GetStoresHandler(storeService, collectiveStoreService);
const guarantee = new Guarantee(getStoresHandler);
guarantee.rescue(handleError);
guarantee.ensure(async () => await connection.disconnect());

export default guarantee.handle;
