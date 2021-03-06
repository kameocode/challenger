package com.kameo.challenger.domain.accounts.db


import com.kameo.challenger.odb.api.IIdentity
import java.time.LocalDateTime
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.validation.constraints.Size


@Entity
data class UserODB(@Id
                   @GeneratedValue(strategy = javax.persistence.GenerationType.AUTO)
                   override val id: Long = 0) : IIdentity {


   @Size(min=4,max=30)
    var login: String? = null

    @Size(min=5,max=100)
    lateinit var email: String

    lateinit var salt: String
    lateinit var passwordHash: String
    lateinit var userStatus: UserStatus

    var oauth2GoogleId: String? = null
    var oauth2FacebookId: String? = null

    var suspendedDueDate: LocalDateTime?=null
    var userRegistrationType = UserRegistrationType.NORMAL
    var failedLoginsNumber: Int = 0

    fun getLoginOrEmail(): String {
        return login ?: email

    }

    companion object {
        @JvmStatic fun ofEmail(email: String): UserODB {
            val u: UserODB = UserODB(-1)
            u.email = email
            return u
        }
    }

}


