import { MariadbConnection } from '../../database/mariadb-connection';
import { MariadbQueryAgent } from '../../database/mariadb-query-agent';
import { MomentProvider } from '../../providers/date-provider/moment-provider';
import { UserStore } from '../../repositories/user/user-store';
import { StoreStore } from '../../repositories/store/store-store';
import { CollectionStore } from '../../repositories/collection/collection-store';
import { CollectionService } from '../../services/collection/collection-service';
import { CollectiveStoreStore } from '../../repositories/collective-store/collective-store-store';
import { CollectiveStoreService } from '../../services/collective-store/collective-store-service';
import { GetUserCollectionsHandler } from '../../controllers/user/get-user-collections-handler';
import { Guarantee } from '../../controllers/utils/guarantee';
import { handleError } from '../../controllers/sentinel';

const connection = new MariadbConnection();
const queryAgent = new MariadbQueryAgent(connection);
const momentProvider = new MomentProvider();
const userStore = new UserStore(queryAgent, momentProvider);
const storeStore = new StoreStore(queryAgent);
const collectionStore = new CollectionStore(queryAgent, userStore, storeStore);
const collectionService = new CollectionService(collectionStore);
const collectiveStoreStore = new CollectiveStoreStore(queryAgent);
const collectiveStoreService = new CollectiveStoreService(collectiveStoreStore);
const getUserCollectionsHandler = new GetUserCollectionsHandler(collectionService);

const guarantee = new Guarantee(getUserCollectionsHandler);
guarantee.rescue(handleError);
guarantee.ensure(async () => await connection.disconnect());

export default guarantee.handle;
