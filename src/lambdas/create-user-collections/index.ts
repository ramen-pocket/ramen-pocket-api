import { MariadbConnection } from '../../database/mariadb-connection';
import { MariadbQueryAgent } from '../../database/mariadb-query-agent';
import { MomentProvider } from '../../providers/date-provider/moment-provider';
import { UserStore } from '../../repositories/user/user-store';
import { StoreStore } from '../../repositories/store/store-store';
import { CollectionStore } from '../../repositories/collection/collection-store';
import { CollectionService } from '../../services/collection/collection-service';
import { PostUserCollectionHandler } from '../../controllers/user/post-user-collection-handler';
import { Guarantee } from '../../controllers/utils/guarantee';
import { handleError } from '../../controllers/sentinel';

const connection = new MariadbConnection();
const queryAgent = new MariadbQueryAgent(connection);
const momentProvider = new MomentProvider();
const userStore = new UserStore(queryAgent, momentProvider);
const storeStore = new StoreStore(queryAgent);
const collectionStore = new CollectionStore(queryAgent, userStore, storeStore);
const collectionService = new CollectionService(collectionStore);
const postUserCollectionHandler = new PostUserCollectionHandler(collectionService);
const guarantee = new Guarantee(postUserCollectionHandler);
guarantee.rescue(handleError);
guarantee.ensure(async () => await connection.disconnect());

export default guarantee.handle;
