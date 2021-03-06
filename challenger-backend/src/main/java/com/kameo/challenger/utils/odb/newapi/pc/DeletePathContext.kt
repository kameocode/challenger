package com.kameo.challenger.utils.odb.newapi.pc

import com.kameo.challenger.utils.odb.newapi.wraps.RootWrap
import javax.persistence.EntityManager
import javax.persistence.Query
import javax.persistence.criteria.CriteriaDelete

@Suppress("UNCHECKED_CAST")
class DeletePathContext<G>(clz: Class<*>,
                           em: EntityManager,
                           override val criteria: CriteriaDelete<G> = em.criteriaBuilder.createCriteriaDelete(clz) as CriteriaDelete<G>)
    : PathContext<G>(em, criteria) {

    init {
        root = (criteria as CriteriaDelete<Any>).from(clz as Class<Any>)
        rootWrap = RootWrap(this, root)
    }

    @Suppress("UNCHECKED_CAST")
    fun <E> invokeDelete(query: (RootWrap<E, E>) -> Unit): Query {
        query.invoke(rootWrap as RootWrap<E, E>)
        calculateWhere(criteria)
        return em.createQuery(criteria)

    }

    private fun calculateWhere(cq: CriteriaDelete<*>) {
        cq.where(getPredicate())
    }
}